import { useEffect, useRef, useState, lazy, Suspense } from "react"
import { useSearchParams } from "react-router-dom"
import { gsap } from "gsap"

import { useVerificationStore } from "@/lib/verification-store"
import { verificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Lazy load heavy components
const HeroBackground = lazy(() => import("@/components/HeroBackground"))
const CTASection = lazy(() => import("@/components/CTASection"))
const CoachSection = lazy(() => import("@/components/CoachSection"))
const DiscountSection = lazy(() => import("@/components/DiscountSection"))

const DUMMY_COA = {
  productName: "Trial Product",
  labName: "Business Central ERP",
  reportDate: "2024-11-07",
  status: "Approved",
  packId: "VSR000000001",
  testParameters: [
    { label: "Purity", value: "99.2%" },
    { label: "Heavy Metals", value: "< 5 ppm" },
    { label: "Moisture", value: "0.3%" },
    { label: "pH Value", value: "7.2" },
    { label: "Microbial Count", value: "< 100 CFU/g" },
  ],
}

const METRIC_TARGETS = {
  purity: 99.2,
  heavyMetals: 5,
  moisture: 0.3,
  ph: 7.2,
  microbial: 100,
}

const INGREDIENT_TARGETS = {
  botanicalBlend: 68,
  activeCompound: 24,
  bioavailability: 93,
}

function getFallbackBatch(serial) {
  const cleaned = serial.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  const suffix = cleaned.slice(-5) || "00000"
  return `BATCH-${suffix}`
}

export default function Verification() {
  const [searchParams] = useSearchParams()
  const {
    customerToken,
    lastMobile,
    lastEmail,
    setCustomerToken,
    setLastMobile,
    setLastEmail,
  } = useVerificationStore()
  const { toast } = useToast()

  // All verification state is now local - not stored
  const [batchId, setBatchId] = useState("[BATCH-XXXXX]")
  const [serialNumber, setSerialNumber] = useState("[SN-XXXXXXXX]")
  const [isValidSerial, setIsValidSerial] = useState(true)
  const [productData, setProductData] = useState(null)
  const [userData, setUserData] = useState(null)
  const [coaData, setCoaData] = useState(null)
  const [otpVerified, setOtpVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  
  // Form state
  const [mobile, setMobile] = useState(lastMobile || "")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState(lastEmail || "")
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [metricValues, setMetricValues] = useState({
    purity: 0,
    heavyMetals: 0,
    moisture: 0,
    ph: 0,
    microbial: 0,
  })
  const [ingredientValues, setIngredientValues] = useState({
    botanicalBlend: 0,
    activeCompound: 0,
    bioavailability: 0,
  })

  const coaSectionRef = useRef(null)
  const lockOverlayRef = useRef(null)

  const verifyProductInitially = async (serial) => {
    try {
      console.log('=== VERIFICATION API CALL ===')
      console.log('Serial:', serial)
      console.log('User token exists:', !!localStorage.getItem('vytals-user-token'))
      
      const response = await verificationApi.verifyProduct(serial)
      console.log('API Response:', response.data)
      
      if (response.success) {
        const data = response.data
        
        console.log('user_has_verified:', data.user_has_verified)
        console.log('requires_login:', data.requires_login)
        console.log('coa_data:', data.coa_data)
        console.log('points_awarded:', data.points_awarded)
        console.log('is_first_unlock:', data.is_first_unlock)
        
        setIsValidSerial(true) // Backend confirmed it's valid
        
        // If user has already verified this product, unlock COA immediately
        if (data.user_has_verified && data.coa_data) {
          console.log('✅ User has verified this product, unlocking COA')
          setCoaData(data.coa_data)
          setOtpVerified(true)
          setIsUnlocked(true)
          
          // Set user data if provided (updated points balance)
          if (data.user_data) {
            setUserData(data.user_data)
          }
          
          // If points were awarded (new verification), show success message
          if (data.points_awarded > 0) {
            toast({
              title: "Success",
              description: `Product verified! ${data.points_awarded} points awarded.`,
              variant: "success",
            })
          }
          
          // Set product data
          setProductData({
            product: data.product,
            batch: data.batch,
            isScanned: data.is_scanned,
            isCoaUnlocked: data.is_coa_unlocked
          })
        } else {
          console.log('🔒 Product verification successful, but requires OTP')
          // Set product data but keep COA locked
          setProductData({
            product: data.product,
            batch: data.batch,
            isScanned: data.is_scanned,
            isCoaUnlocked: data.is_coa_unlocked
          })
        }
      }
    } catch (error) {
      console.error('Verification API error:', error)
      setIsValidSerial(false) // Backend says it's invalid
      setProductData(null)
      toast({
        title: "Invalid Serial Number",
        description: error.message || "This serial number is not valid or does not exist in our system.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const encoded = searchParams.get("ref") || ""
    
    // If no ref parameter, mark as invalid
    if (!encoded) {
      setIsValidSerial(false)
      setSerialNumber("No serial number provided")
      setBatchId("")
      return
    }
    
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(encoded)))
      const nextSerial = decoded?.s
      const nextBatch = decoded?.b || (decoded?.s ? getFallbackBatch(decoded.s) : null)
      
      // Only proceed if we have a valid serial number
      if (!nextSerial) {
        throw new Error('Invalid serial number')
      }
      
      setSerialNumber(nextSerial)
      if (nextBatch) setBatchId(nextBatch)
      setIsValidSerial(true)

      // Always verify the product with the backend
      verifyProductInitially(nextSerial)
    } catch (error) {
      // Invalid ref payload - mark as invalid
      console.error('Invalid verification URL:', error)
      setIsValidSerial(false)
      setSerialNumber("Invalid verification link")
      setBatchId("")
      
      toast({
        title: "Invalid URL",
        description: "The verification link is invalid. Please scan the QR code again.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  useEffect(() => {
    // Only animate on initial load, not on every scroll
    const elements = document.querySelectorAll(".verify-heading, .verify-card")
    if (elements.length > 0) {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.04 }
      )
    }
  }, [])

  useEffect(() => {
    if (otpVerified) setIsUnlocked(true)
  }, [otpVerified])

  useEffect(() => {
    if (!isUnlocked || !coaSectionRef.current) return

    // Simplified animation - just reveal, no complex counters
    const elements = document.querySelectorAll(".coa-reveal")
    if (elements.length > 0) {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 }
      )
    }

    // Set final values immediately
    setMetricValues({
      purity: METRIC_TARGETS.purity,
      heavyMetals: METRIC_TARGETS.heavyMetals,
      moisture: METRIC_TARGETS.moisture,
      ph: METRIC_TARGETS.ph,
      microbial: METRIC_TARGETS.microbial,
    })

    setIngredientValues({
      botanicalBlend: INGREDIENT_TARGETS.botanicalBlend,
      activeCompound: INGREDIENT_TARGETS.activeCompound,
      bioavailability: INGREDIENT_TARGETS.bioavailability,
    })

    // Simple width animation for progress bars
    const fills = document.querySelectorAll(".ingredient-fill")
    if (fills.length > 0) {
      gsap.fromTo(
        fills,
        { width: "0%" },
        { 
          width: (_, target) => target.getAttribute("data-width"), 
          duration: 0.6, 
          ease: "power2.out", 
          stagger: 0.06 
        }
      )
    }
  }, [isUnlocked])

  const sendOtp = async () => {
    if (mobile.replace(/\D/g, "").length < 10) {
      setOtpError("Enter a valid mobile number.")
      return
    }
    
    setOtpError("")
    setIsSendingOtp(true)
    
    try {
      const response = await verificationApi.sendOTP(mobile, serialNumber)
      
      if (response.success) {
        setIsOtpSent(true)
        setLastMobile(mobile) // Save for convenience
        toast({
          title: "Success",
          description: "OTP sent successfully!",
          variant: "success",
        })
      }
    } catch (error) {
      setOtpError(error.message || "Failed to send OTP. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.")
      return
    }
    
    setOtpError("")
    setIsVerifyingOtp(true)
    
    try {
      const response = await verificationApi.verifyOTP(mobile, otp, serialNumber)
      
      if (response.success) {
        const { user, token, verification, coa } = response.data
        
        // Store user data, COA data, and customer token
        setUserData(user)
        setCoaData(coa)
        setCustomerToken(token)
        
        // Unlock COA section with animation
        if (lockOverlayRef.current) {
          gsap.timeline().to(lockOverlayRef.current, {
            opacity: 0,
            scale: 1.04,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => setIsUnlocked(true),
          })
        } else {
          setIsUnlocked(true)
        }
        
        setOtpVerified(true)
        
        toast({
          title: "Success",
          description: `Verification complete! ${verification.points_awarded} points awarded.`,
          variant: "success",
        })
      }
    } catch (error) {
      setOtpError(error.message || "Invalid OTP. Please try again.")
      toast({
        title: "Error",
        description: error.message || "OTP verification failed",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const sendEmailCertificate = async () => {
    if (!email.trim().includes("@")) {
      setEmailError("Enter a valid email address.")
      return
    }
    
    setEmailError("")
    setIsSendingEmail(true)
    
    try {
      const response = await verificationApi.emailCOA(email, batchId, customerToken)
      
      if (response.success) {
        // Update user data with the email
        if (userData && !userData.email) {
          setUserData({ ...userData, email })
        }
        
        setEmailSent(true)
        setEmailVerified(true)
        setLastEmail(email) // Save for convenience
        setShowEmailModal(false)
        toast({
          title: "Success",
          description: "Certificate sent to your email!",
          variant: "success",
        })
      }
    } catch (error) {
      setEmailError(error.message || "Failed to send email. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(234,246,244,0.94),rgba(246,251,250,0.96))] px-4 pb-0 pt-20 sm:px-6 sm:pb-0 sm:pt-24 lg:px-8 lg:pt-28">
      <Suspense fallback={null}>
        <HeroBackground count={60} opacity={0.6} size={0.04} className="pointer-events-none absolute inset-0 z-0" />
      </Suspense>
      <div className="relative z-10 mx-auto max-w-6xl space-y-5 sm:space-y-6">
        {/* SECTION: PAGE HEADER */}
        <header className="verify-heading text-center">
          <h1 className="text-3xl font-black text-[#111111] sm:text-4xl lg:text-5xl">
            {isValidSerial ? "Verify Your Vytal Product" : "Invalid Verification"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {isValidSerial ? "Authenticity • Transparency • Trust" : "Unable to verify this product"}
          </p>
          {isValidSerial && productData && (
            <p className="mt-2 text-sm text-[var(--green)]">Your authenticity is verified ✅</p>
          )}
        </header>

        {/* Show error message if invalid serial */}
        {!isValidSerial && (
          <article className="verify-card rounded-2xl border border-[#D9E2DE] bg-white/88 p-5 backdrop-blur-[1px] sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#111111]">Invalid Serial Number</h2>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">✕</span>
            </div>
            <div className="space-y-3 border-t border-[#E8ECE8] pt-4 text-sm">
              <p className="text-[#111111]">
                The verification link you used is invalid or the serial number does not exist in our system.
              </p>
              <p className="text-[var(--muted)]">
                <strong>Serial Number:</strong> {serialNumber}
              </p>
              <div className="rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3 text-[#111111]">
                <p className="font-medium">What to do next:</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-[var(--muted)]">
                  <li>Scan the QR code on your product again</li>
                  <li>Check if the QR code is damaged or unclear</li>
                  <li>Contact customer support if the issue persists</li>
                </ul>
              </div>
            </div>
          </article>
        )}

        {/* Only show product info and COA if valid serial */}
        {isValidSerial && (
          <>
        {/* SECTION: PRODUCT INFO */}
        <article className="verify-card rounded-2xl border border-[#D9E2DE] bg-white/88 p-5 backdrop-blur-[1px] sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#111111]">Product Information</h2>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eaf8ef] text-xs text-[var(--green)]">✓</span>
          </div>
          <div className="space-y-3 border-t border-[#E8ECE8] pt-4 text-sm">
            <div className="flex flex-col gap-1 border-b border-[#E8ECE8] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-[var(--muted)]">Product Name</span>
              <span className="break-all font-medium text-[#111111] sm:text-right">
                {productData?.product?.name || "Verifying..."}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#E8ECE8] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-[var(--muted)]">Batch Code</span>
              <span className="break-all font-medium text-[#111111] sm:text-right">{batchId}</span>
            </div>
            <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-[var(--muted)]">Pack ID / Serial</span>
              <span className="break-all font-medium text-[#111111] sm:text-right">{serialNumber}</span>
            </div>
            {productData ? (
              <div className="rounded-xl border border-[#CFECD8] bg-[#ECFAF1] px-4 py-2 text-[var(--green)]">
                ✅ {productData?.isCoaUnlocked ? "Product verified - COA unlocked" : "Authentic product - scanned"}
              </div>
            ) : (
              <div className="rounded-xl border border-[#FDE8E8] bg-[#FEF2F2] px-4 py-2 text-red-600">
                ⚠️ Verifying product authenticity...
              </div>
            )}
          </div>
        </article>

        {/* SECTION: COA METRICS (LOCKED UNTIL OTP) */}
        <article ref={coaSectionRef} className="verify-card relative overflow-hidden rounded-2xl border border-[#D9E2DE] bg-white/90 p-5 backdrop-blur-[1px] sm:p-6">
          {!isUnlocked && (
            <div ref={lockOverlayRef} className="absolute inset-0 z-10 flex items-center justify-center bg-white/58 p-3 backdrop-blur-md sm:p-6">
              <div className="w-full max-w-4xl rounded-2xl border border-[#CFECD8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(17,181,178,0.16)] sm:p-6">
                <h3 className="text-xl font-bold text-[#111111]">Identity Check</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Enter mobile number and OTP to unlock full CoA metrics.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="text-sm font-medium text-[#111111]">
                    Mobile Number
                    <Input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2 border-[#E8ECE8] bg-white text-[#111111]" />
                  </label>
                  <Button type="button" onClick={sendOtp} className="h-11 w-full bg-[var(--green)] text-white hover:bg-[var(--green)]/90 sm:w-auto">
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </Button>
                </div>

                {isOtpSent && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label className="text-sm font-medium text-[#111111]">
                      Enter OTP
                      <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} type="text" placeholder="123456" className="mt-2 border-[#E8ECE8] bg-white text-[#111111] tracking-[0.25em]" />
                    </label>
                    <Button type="button" onClick={verifyOtp} disabled={isVerifyingOtp} className="h-11 w-full bg-[var(--green)] text-white hover:bg-[var(--green)]/90 sm:w-auto">
                      {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                )}

                {otpError && <p className="mt-3 text-xs text-red-500">{otpError}</p>}
                <p className="mt-3 text-xs text-[var(--muted)]">CoA details reveal instantly after successful verification.</p>
              </div>
            </div>
          )}

          <div className="coa-reveal flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-[#111111] sm:text-3xl">Certificate of Analysis (via Business Central)</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Quality test results from Business Central ERP</p>
            </div>
            <span className="rounded-full bg-[#11b5b2] px-3 py-1 text-xs font-semibold text-white">{DUMMY_COA.status}</span>
          </div>

          <div className="coa-reveal mt-4 flex flex-col gap-1 border-b border-[#E8ECE8] pb-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[var(--muted)]">Report Date</span>
            <span className="font-medium text-[#111111] sm:text-right">
              {coaData?.issue_date || DUMMY_COA.reportDate}
            </span>
          </div>

          <h4 className="coa-reveal mt-4 text-xl font-bold text-[#111111]">Test Parameters</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Purity</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.purity}%</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Heavy Metals</p>
              <p className="text-2xl font-bold text-[#111111]">{`< ${metricValues.heavyMetals} ppm`}</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Moisture</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.moisture}%</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">pH Value</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.ph}</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3 sm:col-span-2">
              <p className="text-sm text-[var(--muted)]">Microbial Count</p>
              <p className="text-2xl font-bold text-[#111111]">{`< ${metricValues.microbial} CFU/g`}</p>
            </div>
          </div>

          <div className="coa-reveal mt-4 rounded-xl border border-[#CFECD8] bg-[#ECFAF1] px-4 py-3 text-[#21543a]">
            <p className="text-sm text-[var(--muted)]">Conclusion</p>
            <p className="text-lg font-medium">All parameters within specifications. Batch approved for release.</p>
          </div>

          <div className="coa-reveal mt-4 rounded-2xl border border-[#D9E2DE] bg-[#F7F8F5] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-[#111111]">Ingredient Composition Snapshot</h4>
              <span className="rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-semibold text-[var(--green)]">Batch Profile</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">Interactive preview of this batch profile before full report download.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Botanical Blend</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.botanicalBlend}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="68%" />
                </div>
              </div>
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Active Compound</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.activeCompound}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="24%" />
                </div>
              </div>
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Bioavailability Score</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.bioavailability}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="93%" />
                </div>
              </div>
            </div>
          </div>

          {isUnlocked && (
            <div className="coa-reveal mt-4 space-y-3">
              <Button 
                type="button" 
                onClick={() => {
                  // Pre-fill email if user has one or use last saved email
                  if (userData?.email && !email) {
                    setEmail(userData.email)
                  } else if (lastEmail && !email) {
                    setEmail(lastEmail)
                  }
                  setShowEmailModal(true)
                }} 
                className="w-full bg-[#11b5b2] text-white hover:bg-[#11b5b2]/90"
              >
                📧 Email Full CoA PDF
              </Button>
              {emailSent && <p className="text-sm text-[#11b5b2]">Certificate sent to your email.</p>}
            </div>
          )}
        </article>

        {/* SECTION: COACH (UNLOCKED AFTER OTP) */}
        {isUnlocked && (
          <Suspense fallback={<div className="h-32" />}>
            <CoachSection />
          </Suspense>
        )}

        {/* SECTION: DISCOUNT (GIFT-BOX UNWRAP + CODE REVEAL) */}
        {isUnlocked && emailSent && (
          <Suspense fallback={<div className="h-32" />}>
            <DiscountSection />
          </Suspense>
        )}
          </>
        )}

      </div>

      {/* SECTION: SHOP CTA (ALWAYS VISIBLE NEAR FOOTER) */}
      <div className="relative z-10 mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <Suspense fallback={<div className="h-48" />}>
          <CTASection fullBleed />
        </Suspense>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#D9E2DE] bg-white p-5 shadow-2xl">
            <h4 className="text-xl font-bold text-[#111111] sm:text-2xl">Send CoA to Email</h4>
            <p className="mt-1 text-sm text-[var(--muted)]">We&apos;ll send the full certificate PDF to your inbox.</p>
            <label className="mt-4 block text-sm font-medium text-[#111111]">
              Email Address
              <Input 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                type="email" 
                placeholder={lastEmail || "Enter your email"} 
                className="mt-2 border-[#E8ECE8] bg-white text-[#111111]" 
              />
            </label>
            {emailError && <p className="mt-2 text-xs text-red-500">{emailError}</p>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)} className="w-full border-[#D9E2DE] bg-white text-[#111111] sm:w-auto">
                Cancel
              </Button>
              <Button type="button" onClick={sendEmailCertificate} className="w-full bg-[#11b5b2] text-white hover:bg-[#11b5b2]/90 sm:w-auto">
                {isSendingEmail ? "Sending..." : "Send Certificate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
