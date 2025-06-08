import { React, type CustomModalityComponent } from '@nlxai/touchpoint-ui'

const { useState, useRef, useEffect } = React

/**
 * Data structure for the ConfirmPhoneNumber modality
 */
export interface ConfirmPhoneNumberData {
  /** Title text. Defaults to "Confirm your phone number" */
  title?: string
  /** Subtitle text. Defaults to "Please verify your phone number is correct." */
  subtitle?: string
  /** Initial phone number to display */
  phoneNumber?: string
  /** Country code (e.g., "US", "GB", "FR") for flag display - will be auto-detected if not provided */
  countryCode?: string
  /** Choice ID to send when confirmed */
  confirmChoiceId: string
  /** Choice ID to send when user wants to change number */
  changeChoiceId?: string
  /** Text for the change link. Defaults to "Not your number?" */
  changeText?: string
  /** Text for the confirm button. Defaults to "Confirm" */
  confirmButtonText?: string
}

// FIXED: Phone number formatting patterns for common countries
const phoneFormats: Record<string, { pattern: RegExp; format: string; flag: string; digits: number; dialingCode: string }> = {
  US: { pattern: /(\d{3})(\d{3})(\d{4})/, format: '($1) $2-$3', flag: '🇺🇸', digits: 10, dialingCode: '+1' },
  CA: { pattern: /(\d{3})(\d{3})(\d{4})/, format: '($1) $2-$3', flag: '🇨🇦', digits: 10, dialingCode: '+1' },
  // FIXED: UK should be 11 digits with proper formatting
  GB: { pattern: /(\d{4})(\d{3})(\d{4})/, format: '$1 $2 $3', flag: '🇬🇧', digits: 11, dialingCode: '+44' },
  FR: { pattern: /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, format: '$1 $2 $3 $4 $5', flag: '🇫🇷', digits: 10, dialingCode: '+33' },
  DE: { pattern: /(\d{4})(\d{7})/, format: '$1 $2', flag: '🇩🇪', digits: 11, dialingCode: '+49' },
  JP: { pattern: /(\d{3})(\d{4})(\d{4})/, format: '$1-$2-$3', flag: '🇯🇵', digits: 11, dialingCode: '+81' },
  AU: { pattern: /(\d{4})(\d{3})(\d{3})/, format: '$1 $2 $3', flag: '🇦🇺', digits: 10, dialingCode: '+61' },
  IN: { pattern: /(\d{5})(\d{5})/, format: '$1 $2', flag: '🇮🇳', digits: 10, dialingCode: '+91' },
  BR: { pattern: /(\d{2})(\d{5})(\d{4})/, format: '($1) $2-$3', flag: '🇧🇷', digits: 11, dialingCode: '+55' },
  MX: { pattern: /(\d{3})(\d{3})(\d{4})/, format: '$1 $2 $3', flag: '🇲🇽', digits: 10, dialingCode: '+52' },
}

// FIXED: Auto-detect country based on phone number patterns (international format only)
const detectCountryFromPhoneNumber = (phoneNumber: string): string => {
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  
  console.log('=== DETECTION LOGIC ===')
  console.log('Original number:', phoneNumber)
  console.log('Digits only:', digitsOnly)
  console.log('Length:', digitsOnly.length)
  
  // Handle numbers with country codes first
  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    console.log('Detected as US/CA (1 prefix, 11 digits)')
    return 'US' // Could be US or CA - default to US
  }
  
  // FIXED: UK detection - international format only (+44)
  if (digitsOnly.startsWith('44')) {
    console.log('Starts with 44, checking length...')
    // UK numbers: +44 + 10-11 digits = 12-13 total digits
    if (digitsOnly.length >= 12 && digitsOnly.length <= 13) {
      console.log('Detected as GB (44 prefix, 12-13 digits)')
      return 'GB'
    }
  }
  
  if (digitsOnly.startsWith('33') && digitsOnly.length >= 12) {
    console.log('Detected as FR')
    return 'FR'
  }
  if (digitsOnly.startsWith('49') && digitsOnly.length >= 13) {
    console.log('Detected as DE')
    return 'DE'
  }
  if (digitsOnly.startsWith('81') && digitsOnly.length >= 13) {
    console.log('Detected as JP')
    return 'JP'
  }
  if (digitsOnly.startsWith('61') && digitsOnly.length >= 12) {
    console.log('Detected as AU')
    return 'AU'
  }
  if (digitsOnly.startsWith('91') && digitsOnly.length >= 12) {
    console.log('Detected as IN')
    return 'IN'
  }
  if (digitsOnly.startsWith('55') && digitsOnly.length >= 13) {
    console.log('Detected as BR')
    return 'BR'
  }
  if (digitsOnly.startsWith('52') && digitsOnly.length >= 12) {
    console.log('Detected as MX')
    return 'MX'
  }
  
  // Handle numbers without country codes by length and pattern
  if (digitsOnly.length === 10) {
    if (digitsOnly.match(/^[2-9]\d{2}[2-9]\d{6}$/)) {
      console.log('Detected as US (10 digits, US pattern)')
      return 'US' // North American pattern
    }
    if (digitsOnly.match(/^0[1-9]\d{8}$/)) {
      console.log('Detected as FR (10 digits, 0 prefix)')
      return 'FR' // French mobile pattern
    }
    if (digitsOnly.match(/^04\d{8}$/)) {
      console.log('Detected as AU (10 digits, 04 prefix)')
      return 'AU' // Australian mobile pattern
    }
    if (digitsOnly.match(/^[6-9]\d{9}$/)) {
      console.log('Detected as IN (10 digits, 6-9 prefix)')
      return 'IN' // Indian mobile pattern
    }
    console.log('Default to US for 10 digits')
    return 'US' // Default for 10-digit numbers
  }
  
  if (digitsOnly.length === 11) {
    if (digitsOnly.startsWith('1')) {
      console.log('Detected as US (11 digits, 1 prefix)')
      return 'US' // US/CA with country code
    }
    console.log('Default to BR for 11 digits')
    return 'BR' // Default for 11-digit numbers
  }
  
  // Default fallback
  console.log('Defaulting to US')
  console.log('=== END DETECTION LOGIC ===')
  return 'US'
}

const ConfirmPhoneNumberComponent: CustomModalityComponent<ConfirmPhoneNumberData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  // Debug logging
  console.log('ConfirmPhoneNumberComponent rendered with:', { enabled, data })
  
  // Default values
  const title = data.title ?? "Confirm your phone number"
  const subtitle = data.subtitle ?? "Please verify your phone number is correct."
  const changeText = data.changeText ?? "Not your number?"
  const confirmButtonText = data.confirmButtonText ?? "Confirm"
  
  // Auto-detect country if not provided - do this FIRST
  const detectedCountry = data.phoneNumber ? detectCountryFromPhoneNumber(data.phoneNumber) : 'US'
  const initialCountry = data.countryCode || detectedCountry
  
  console.log('=== COUNTRY DETECTION ===')
  console.log('Input phone number:', data.phoneNumber)
  console.log('Provided country code:', data.countryCode)
  console.log('Detected country:', detectedCountry)
  console.log('Final initial country:', initialCountry)
  console.log('=== END COUNTRY DETECTION ===')
  
  // State for current country (can change based on user input)
  const [currentCountry, setCurrentCountry] = useState(initialCountry)
  
  // Get country format info
  const countryFormat = phoneFormats[currentCountry] || phoneFormats.US
  const { pattern, format, flag, digits } = countryFormat
  
  // FIXED: Parse initial phone number into digits array - use detected country
  const parsePhoneNumber = (phone?: string, country: string = currentCountry): string[] => {
    const targetFormat = phoneFormats[country] || phoneFormats.US
    const targetDigits = targetFormat.digits
    
    if (!phone) return new Array(targetDigits).fill('')
    
    // Extract only digits
    const digitsOnly = phone.replace(/\D/g, '')
    console.log('=== PARSING PHONE NUMBER ===')
    console.log('Input phone:', phone)
    console.log('Target country:', country)
    console.log('Target digits expected:', targetDigits)
    console.log('Digits only:', digitsOnly)
    
    // Handle numbers with country codes
    let processedDigits = digitsOnly
    if (digitsOnly.length > targetDigits) {
      // Remove country code if present
      if (country === 'US' || country === 'CA') {
        if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
          processedDigits = digitsOnly.substring(1)
        }
      } else if (country === 'GB') {
        // FIXED: Handle UK country code removal
        if (digitsOnly.startsWith('44')) {
          // Remove +44 and expect remaining digits
          let remainingDigits = digitsOnly.substring(2)
          console.log('Remaining digits after removing 44:', remainingDigits)
          
          // If it doesn't start with 0, add it (UK domestic format)
          if (!remainingDigits.startsWith('0')) {
            remainingDigits = '0' + remainingDigits
            console.log('Added leading 0:', remainingDigits)
          }
          processedDigits = remainingDigits
        }
      } else {
        // Handle other country codes
        const dialingCode = phoneFormats[country]?.dialingCode.replace('+', '') || ''
        if (digitsOnly.startsWith(dialingCode)) {
          processedDigits = digitsOnly.substring(dialingCode.length)
        }
      }
    }
    
    // Pad or trim to match expected length
    const paddedDigits = processedDigits.padEnd(targetDigits, '').slice(0, targetDigits)
    console.log('Processed digits:', processedDigits)
    console.log('Final digit array:', paddedDigits.split(''))
    console.log('=== END PARSING ===')
    return paddedDigits.split('')
  }
  
  // State for storing the phone digits - use the detected country for initial parsing
  const [phoneDigits, setPhoneDigits] = useState<string[]>(() => parsePhoneNumber(data.phoneNumber, initialCountry))
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Update phone digits when country changes
  useEffect(() => {
    if (data.phoneNumber) {
      setPhoneDigits(parsePhoneNumber(data.phoneNumber, currentCountry))
    } else {
      // Reset to empty array with new country's digit count
      const targetFormat = phoneFormats[currentCountry] || phoneFormats.US
      setPhoneDigits(new Array(targetFormat.digits).fill(''))
    }
  }, [currentCountry, data.phoneNumber])
  
  // Auto-detect country based on user input
  useEffect(() => {
    const currentNumber = phoneDigits.join('')
    if (currentNumber.length >= 3 && !data.countryCode) {
      const detectedCountry = detectCountryFromPhoneNumber(currentNumber)
      if (detectedCountry !== currentCountry) {
        console.log('=== COUNTRY AUTO-DETECTION ===')
        console.log('Phone digits entered:', phoneDigits)
        console.log('Current number:', currentNumber)
        console.log('Previous country:', currentCountry)
        console.log('Detected country:', detectedCountry)
        console.log('Switching country format...')
        setCurrentCountry(detectedCountry)
        console.log('Country switched to:', detectedCountry)
      }
    }
  }, [phoneDigits, currentCountry, data.countryCode])
  
  // Fade-in effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])
  
  // Focus first empty input when component mounts
  useEffect(() => {
    if (enabled && !hasSubmitted && isVisible) {
      const firstEmptyIndex = phoneDigits.findIndex(digit => digit === '')
      const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus()
      }, 100)
    }
  }, [enabled, hasSubmitted, isVisible, phoneDigits])
  
  // Format phone number for display - show international format if country code was detected
  const formatPhoneNumber = (digits: string[]): string => {
    const number = digits.join('')
    if (number.length !== digits.length || digits.includes('')) {
      // If incomplete, show partial formatting
      return number
    }
    
    // For international numbers, show with country code
    if (data.phoneNumber && data.phoneNumber.includes('+')) {
      const countryCode = countryFormat.dialingCode
      // Remove leading 0 for international display if present
      const internationalNumber = number.startsWith('0') ? number.substring(1) : number
      const formattedInternal = internationalNumber.replace(pattern, format)
      return `${countryCode} ${formattedInternal}`
    }
    
    // Otherwise show domestic format
    return number.replace(pattern, format)
  }
  
  const handleChange = (index: number, value: string) => {
    if (hasSubmitted) return
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return
    
    const newDigits = [...phoneDigits]
    newDigits[index] = value
    setPhoneDigits(newDigits)
    
    // Auto-focus next input only if there's a value entered
    if (value && index < digits - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 10)
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasSubmitted) return
    
    // Handle backspace
    if (e.key === 'Backspace' && !phoneDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < digits - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent) => {
    if (hasSubmitted) return
    
    e.preventDefault()
    
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, digits)
    
    if (pastedData) {
      const newDigits = [...phoneDigits]
      pastedData.split('').forEach((digit, index) => {
        if (index < digits) {
          newDigits[index] = digit
        }
      })
      setPhoneDigits(newDigits)
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newDigits.findIndex(digit => digit === '')
      const focusIndex = nextEmptyIndex === -1 ? digits - 1 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()
    }
  }
  
  const handleChangeNumber = () => {
    if (enabled && data.changeChoiceId) {
      console.log('=== CHANGE NUMBER CLICKED ===')
      console.log('Change choice ID:', data.changeChoiceId)
      console.log('Current phone state:', phoneDigits)
      console.log('Current country:', currentCountry)
      console.log('Sending change choice to NLX...')
      
      try {
        conversationHandler.sendChoice(data.changeChoiceId)
        console.log('✅ Change choice sent successfully')
        console.log('=== END CHANGE CHOICE TRANSMISSION ===')
      } catch (error) {
        console.error('❌ Error sending change choice:', error)
      }
    } else {
      console.log('=== CHANGE NUMBER CLICK IGNORED ===')
      console.log('Enabled:', enabled)
      console.log('Change choice ID provided:', !!data.changeChoiceId)
      console.log('Reason: Component disabled or no change choice ID provided')
    }
  }
  
  const handleConfirm = () => {
    if (enabled && !hasSubmitted) {
      const fullNumber = phoneDigits.join('')
      const formattedNumber = formatPhoneNumber(phoneDigits)
      console.log('=== CONFIRM BUTTON CLICKED ===')
      console.log('Raw phone digits:', phoneDigits)
      console.log('Full number (joined):', fullNumber)
      console.log('Formatted number:', formattedNumber)
      console.log('Detected country:', currentCountry)
      
      setHasSubmitted(true)
      
      // Prepare the data being sent - include both formats
      const contextData = {
        phoneNumber: fullNumber,
        formattedPhoneNumber: formatPhoneNumber(phoneDigits),
        phoneCountryCode: currentCountry,
        // Add international format if applicable
        internationalPhoneNumber: data.phoneNumber && data.phoneNumber.includes('+') 
          ? `${countryFormat.dialingCode}${fullNumber.startsWith('0') ? fullNumber.substring(1) : fullNumber}`
          : undefined
      }
      
      const metadataData = {
        responseIndex: undefined,
        messageIndex: undefined
      }
      
      console.log('=== SENDING CHOICE TO NLX ===')
      console.log('Choice ID:', data.confirmChoiceId)
      console.log('Context data being sent:', contextData)
      console.log('Metadata being sent:', metadataData)
      console.log('sendChoice function call starting...')
      
      // Send choice with phone data as context
      try {
        conversationHandler.sendChoice(
          data.confirmChoiceId,
          contextData,
          metadataData
        )
        console.log('✅ sendChoice call completed successfully')
        console.log('=== END CHOICE TRANSMISSION ===')
      } catch (error) {
        console.error('❌ Error in sendChoice call:', error)
        console.log('=== CHOICE TRANSMISSION FAILED ===')
      }
    } else {
      console.log('=== CONFIRM BUTTON CLICK IGNORED ===')
      console.log('Enabled:', enabled)
      console.log('Has submitted:', hasSubmitted)
      console.log('Reason: Component disabled or already submitted')
    }
  }
  
  // FIXED: Determine input groupings based on country format (no parentheses)
  const getInputGroups = () => {
    switch (currentCountry) {
      case 'US':
      case 'CA':
        return [[0, 3], [3, 6], [6, 10]] // XXX XXX-XXXX (no parentheses)
      case 'GB':
        // FIXED: UK format for 11 digits - 0XXXX XXX XXXX
        return [[0, 5], [5, 8], [8, 11]] // 0XXXX XXX XXXX
      case 'AU':
        return [[0, 4], [4, 7], [7, 10]] // XXXX XXX XXX
      case 'FR':
        return [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10]] // XX XX XX XX XX
      case 'DE':
        return [[0, 4], [4, 11]] // XXXX XXXXXXX
      case 'JP':
        return [[0, 3], [3, 7], [7, 11]] // XXX-XXXX-XXXX
      case 'BR':
        return [[0, 2], [2, 7], [7, 11]] // XX XXXXX-XXXX (no parentheses)
      case 'IN':
        return [[0, 5], [5, 10]] // XXXXX XXXXX
      case 'MX':
        return [[0, 3], [3, 6], [6, 10]] // XXX XXX XXXX
      default:
        return [[0, 3], [3, 6], [6, 10]] // Default to US format
    }
  }
  
  const inputGroups = getInputGroups()
  const isNumberComplete = phoneDigits.every(d => d !== '')
  
  return (
    <div style={{
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '300px',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--outer-border-radius)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out'
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 500,
        color: 'var(--primary-80)',
        marginBottom: '12px',
        textAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.8s ease-in-out 0.2s, transform 0.8s ease-in-out 0.2s'
      }}>
        {title}
      </h2>
      
      {/* Subtitle */}
      <p style={{
        fontSize: '16px',
        color: 'var(--primary-60)',
        textAlign: 'center',
        marginBottom: '20px',
        maxWidth: '400px',
        lineHeight: 1.5,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.8s ease-in-out 0.4s, transform 0.8s ease-in-out 0.4s'
      }}>
        {subtitle}
      </p>
      
      {/* Country flag */}
      <div style={{
        fontSize: '48px',
        lineHeight: 1,
        userSelect: 'none',
        marginBottom: '20px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.8s ease-in-out 0.6s, transform 0.8s ease-in-out 0.6s, font-size 0.3s ease'
      }}>
        {flag}
      </div>
      
      {/* Phone input groups */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.8s ease-in-out 0.8s, transform 0.8s ease-in-out 0.8s'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {inputGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {/* Render inputs for this group */}
              {Array.from({ length: group[1] - group[0] }, (_, i) => group[0] + i).map((index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={phoneDigits[index] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={!enabled || hasSubmitted}
                  style={{
                    width: '40px',
                    height: '48px',
                    fontSize: '24px',
                    textAlign: 'center',
                    backgroundColor: hasSubmitted ? 'var(--primary-5)' : phoneDigits[index] ? 'var(--primary-10)' : 'transparent',
                    border: hasSubmitted ? '2px solid var(--primary-20)' : phoneDigits[index] ? '2px solid var(--accent)' : '2px solid var(--primary-40)',
                    borderRadius: 'var(--inner-border-radius)',
                    color: hasSubmitted ? 'var(--primary-40)' : 'var(--primary-80)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: enabled && !hasSubmitted ? 'text' : 'not-allowed',
                    caretColor: 'var(--accent)',
                    opacity: hasSubmitted ? 0.5 : 1
                  }}
                  onFocus={(e) => {
                    if (!hasSubmitted) {
                      e.target.style.borderColor = 'var(--accent)'
                      e.target.style.backgroundColor = 'var(--primary-5)'
                    }
                  }}
                  onBlur={(e) => {
                    if (!phoneDigits[index] && !hasSubmitted) {
                      e.target.style.borderColor = 'var(--primary-40)'
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                  autoComplete="off"
                />
              ))}
              
              {/* Separator between groups */}
              {groupIndex < inputGroups.length - 1 && (
                <span style={{ fontSize: '24px', color: 'var(--primary-40)', alignSelf: 'center', margin: '0 8px' }}>
                  {currentCountry === 'JP' || 
                   (groupIndex === 1 && (currentCountry === 'US' || currentCountry === 'CA' || currentCountry === 'BR')) ? '-' : ' '}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Formatted phone display */}
      {isNumberComplete && (
        <p style={{
          marginBottom: '20px',
          color: 'var(--accent)',
          fontSize: '14px',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out 1s',
          textAlign: 'center',
          wordBreak: 'break-all',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {formatPhoneNumber(phoneDigits)}
        </p>
      )}
      
      {/* Confirm button */}
      {isNumberComplete && !hasSubmitted && (
        <button
          onClick={handleConfirm}
          disabled={!enabled}
          style={{
            marginBottom: '20px',
            padding: '14px 28px',
            backgroundColor: 'transparent',
            color: enabled ? 'var(--accent)' : 'var(--primary-40)',
            border: enabled ? '2px solid var(--accent)' : '2px solid var(--primary-40)',
            borderRadius: 'var(--inner-border-radius)',
            fontSize: '16px',
            fontWeight: 500,
            cursor: enabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease, opacity 0.8s ease-in-out 1.2s',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (enabled) {
              e.currentTarget.style.backgroundColor = 'var(--primary-5)'
            }
          }}
          onMouseLeave={(e) => {
            if (enabled) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          {/* Mobile phone icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM17 18H7V6H17V18Z"
              fill="currentColor"
            />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
          </svg>
          {confirmButtonText}
        </button>
      )}
      
      {/* Change number link */}
      {data.changeChoiceId && (
        <button
          onClick={handleChangeNumber}
          disabled={!enabled}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-60)',
            fontSize: '16px',
            cursor: enabled ? 'pointer' : 'not-allowed',
            textDecoration: 'none',
            padding: '8px',
            transition: 'color 0.2s ease, opacity 0.8s ease-in-out 1.4s, transform 0.8s ease-in-out 1.4s',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(5px)'
          }}
          onMouseEnter={(e) => {
            if (enabled) {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.textDecoration = 'underline'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--primary-60)'
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          {changeText}
        </button>
      )}
    </div>
  )
}

export default ConfirmPhoneNumberComponent