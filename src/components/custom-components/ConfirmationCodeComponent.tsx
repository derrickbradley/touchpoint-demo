import { React, type CustomModalityComponent } from '@nlxai/touchpoint-ui'
import type { ConversationHandler } from '@nlxai/chat-core'

const { useState, useRef, useEffect } = React

// FIX 2: Manually define the component type signature.
type CustomComponent<T = any> = React.FC<{
  data: T;
  conversationHandler: ConversationHandler;
  enabled?: boolean;
}>;

/**
 * Data structure for the ConfirmationCode modality
 */
export interface ConfirmationCodeData {
  /** Title text. Defaults to "Enter the 6 digit code" */
  title?: string
  /** Subtitle text. Defaults to security message */
  subtitle?: string
  /** Number of digits in the code. Defaults to 6 */
  codeLength?: number
  /** Whether to show the separator dash. Defaults to true */
  showSeparator?: boolean
  /** Text for the resend link. Defaults to "Didn't get the code? Resend" */
  resendText?: string
  /** Choice ID to send when code is complete */
  submitChoiceId: string
  /** Choice ID to send when resend is clicked */
  resendChoiceId?: string
  /** Whether to send as slot (true) or choice payload (false). Defaults to false */
  sendAsSlot?: boolean
}

// FIX 3: Apply our manually-defined type here.
const ConfirmationCodeComponent: CustomComponent<ConfirmationCodeData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  // Debug logging
  console.log('ConfirmationCodeComponent rendered with:', { enabled, data })
  
  // Default values
  const title = data.title ?? "Enter the 6 digit code"
  const subtitle = data.subtitle ?? "Enter the code sent to your other device for security reasons to make sure it is you."
  const codeLength = data.codeLength ?? 6
  const showSeparator = data.showSeparator ?? true
  const resendText = data.resendText ?? "Didn't get the code? Resend"
  
  // FIX 4: Removed the unused 'sendAsSlot' variable.
  // const sendAsSlot = data.sendAsSlot ?? false
  
  // State for storing the code digits
  const [code, setCode] = useState<string[]>(new Array(codeLength).fill(''))
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // All of your logic and handler functions are preserved.
  useEffect(() => {
    if (enabled && inputRefs.current[0] && !hasSubmitted) {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [enabled, hasSubmitted])
  
  useEffect(() => {
    const isComplete = code.every(digit => digit !== '')
    
    if (isComplete && enabled && !hasSubmitted) {
      const fullCode = code.join('')
      console.log('Code complete, submitting:', fullCode)
      
      setHasSubmitted(true)
      
      let submitted = false
      
      const submitCode = async () => {
        if (submitted) return
        submitted = true
        
        console.log('Sending confirmation code to slot:', fullCode)
        conversationHandler.sendSlots({ confirmationCode: fullCode })
        
        if (data.submitChoiceId) {
          setTimeout(() => {
            console.log('Sending choice:', data.submitChoiceId)
            conversationHandler.sendChoice(data.submitChoiceId)
          }, 500)
        }
      }
      
      submitCode()
    }
  }, [code, enabled, hasSubmitted, conversationHandler, data.submitChoiceId])
  
  const handleChange = (index: number, value: string) => {
    if (hasSubmitted) return
    if (value && !/^\d$/.test(value)) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasSubmitted) return
    
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent) => {
    if (hasSubmitted) return
    
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength)
    
    if (pastedData) {
      const newCode = [...code]
      pastedData.split('').forEach((digit, index) => {
        if (index < codeLength) {
          newCode[index] = digit
        }
      })
      setCode(newCode)
      
      const nextEmptyIndex = newCode.findIndex(digit => digit === '')
      const focusIndex = nextEmptyIndex === -1 ? codeLength - 1 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()
    }
  }
  
  const handleResend = () => {
    if (enabled && data.resendChoiceId) {
      console.log('Resend clicked')
      setCode(new Array(codeLength).fill(''))
      setHasSubmitted(false)
      inputRefs.current[0]?.focus()
      conversationHandler.sendChoice(data.resendChoiceId)
    }
  }
  
  const handleManualSubmit = () => {
    if (code.every(digit => digit !== '') && !hasSubmitted) {
      const fullCode = code.join('')
      console.log('Manual submit:', fullCode)
      setHasSubmitted(true)
      
      conversationHandler.sendSlots({ confirmationCode: fullCode })
      
      setTimeout(() => {
        conversationHandler.sendChoice(data.submitChoiceId)
      }, 500)
    }
  }
  
  const separatorIndex = Math.floor(codeLength / 2)
  
  // The entire JSX render block is preserved as it uses standard HTML elements
  // that were not causing any build errors.
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
      borderRadius: 'var(--outer-border-radius)'
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 500,
        color: 'var(--primary-80)',
        marginBottom: '12px',
        textAlign: 'center'
      }}>
        {title}
      </h2>
      
      {/* Subtitle */}
      <p style={{
        fontSize: '16px',
        color: 'var(--primary-60)',
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '400px',
        lineHeight: 1.5
      }}>
        {subtitle}
      </p>
      
      {/* Code input boxes */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        {Array.from({ length: codeLength }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[index]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={!enabled || hasSubmitted}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '32px',
                textAlign: 'center',
                backgroundColor: hasSubmitted ? 'var(--primary-5)' : code[index] ? 'var(--primary-10)' : 'transparent',
                border: hasSubmitted ? '2px solid var(--primary-20)' : code[index] ? '2px solid var(--accent)' : '2px solid var(--primary-40)',
                borderRadius: 'var(--inner-border-radius)',
                color: hasSubmitted ? 'var(--primary-40)' : 'var(--primary-80)',
                outline: 'none',
                transition: 'all 1.2s ease',
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
                if (!code[index] && !hasSubmitted) {
                  e.target.style.borderColor = 'var(--primary-40)'
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
              autoComplete="off"
            />
            {showSeparator && index === separatorIndex - 1 && (
              <span style={{
                fontSize: '32px',
                color: 'var(--primary-40)',
                userSelect: 'none'
              }}>
                —
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Debug: Manual submit button */}
      {!hasSubmitted && code.every(digit => digit !== '') && (
        <button
          onClick={handleManualSubmit}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: 'var(--accent)',
            color: 'var(--secondary-80)',
            border: 'none',
            borderRadius: 'var(--inner-border-radius)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Submit Code
        </button>
      )}
      
      {/* Status message */}
      {hasSubmitted && (
        <p style={{
          marginBottom: '20px',
          color: 'var(--accent)',
          fontSize: '14px'
        }}>
          Code submitted: {code.join('')}
        </p>
      )}
      
      {/* Resend link */}
      {data.resendChoiceId && (
        <button
          onClick={handleResend}
          disabled={!enabled}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-60)',
            fontSize: '16px',
            cursor: enabled ? 'pointer' : 'not-allowed',
            textDecoration: 'none',
            padding: '8px',
            transition: 'color 0.2s ease'
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
          {resendText}
        </button>
      )}
    </div>
  )
}

export default ConfirmationCodeComponent