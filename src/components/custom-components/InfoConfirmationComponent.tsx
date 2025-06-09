import { React, type CustomModalityComponent } from '@nlxai/touchpoint-ui'

const { useState, useEffect } = React

// FIX 2: Manually define the component type signature.
type CustomComponent<T = any> = React.FC<{
  data: T;
  conversationHandler: ConversationHandler;
  enabled?: boolean;
}>;

/**
 * Data structure for the InfoConfirmation modality
 */
export interface InfoConfirmationData {
  /** Title text. Defaults to "Confirm your information" */
  title?: string
  /** Subtitle text. Defaults to "Please verify the information below is correct." */
  subtitle?: string
  /** Label for the input field. Defaults to "Last Name" */
  inputLabel?: string
  /** Placeholder text for the input. Defaults to "Enter your last name" */
  placeholder?: string
  /** The slot name to save the value to. Defaults to "lastName" */
  slotName?: string
  /** The initial value to display (can be from slot interpolation) */
  initialValue?: string
  /** Choice ID to send when confirmed */
  confirmChoiceId: string
  /** Label for the confirm button. Defaults to "Confirm" */
  confirmButtonLabel?: string
}

// FIX 3: Apply our manually-defined type here.
const InfoConfirmationComponent: CustomComponent<InfoConfirmationData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  // All remaining code is preserved, as it was correct.
  console.log('InfoConfirmationComponent rendered with:', { enabled, data })
  
  const title = data.title ?? "Confirm your information"
  const subtitle = data.subtitle ?? "Please verify the information below is correct."
  const inputLabel = data.inputLabel
  const placeholder = data.placeholder
  const slotName = data.slotName ?? "lastName"
  const confirmButtonLabel = data.confirmButtonLabel ?? "Confirm"
  
  const getInitialValue = () => {
    if (data.initialValue) {
      console.log('Using provided initial value:', data.initialValue)
      return data.initialValue
    }
    
    try {
      const slots = (conversationHandler as any).getSlots?.() || {}
      console.log('Checking slots for:', slotName, 'Found:', slots[slotName])
      return slots[slotName] || ''
    } catch (error) {
      console.log('Could not get initial value from slots:', error)
      return ''
    }
  }
  
  const [inputValue, setInputValue] = useState<string>(getInitialValue())
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  useEffect(() => {
    const initialValue = getInitialValue()
    if (initialValue) {
      setInputValue(initialValue)
    }
  }, [])
  
  const handleSubmit = () => {
    if (!hasSubmitted && inputValue.trim() && enabled) {
      console.log('Submitting info:', inputValue)
      setHasSubmitted(true)
      
      const slotUpdate = { [slotName]: inputValue.trim() }
      console.log('Updating slot:', slotUpdate)
      conversationHandler.sendSlots(slotUpdate)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmit()
    }
  }
  
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
      minHeight: '250px',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--outer-border-radius)'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 500,
        color: 'var(--primary-80)',
        marginBottom: '12px',
        textAlign: 'center'
      }}>
        {title}
      </h2>
      
      <p style={{
        fontSize: '16px',
        color: 'var(--primary-60)',
        textAlign: 'center',
        marginBottom: '30px',
        maxWidth: '400px',
        lineHeight: 1.5
      }}>
        {subtitle}
      </p>
      
      <div style={{
        width: '100%',
        maxWidth: '400px',
        marginBottom: '30px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: 'var(--primary-60)',
          marginBottom: '8px'
        }}>
          {inputLabel}
        </label>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={!enabled || hasSubmitted}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '18px',
            backgroundColor: hasSubmitted ? 'var(--primary-5)' : 'var(--primary-10)',
            border: hasSubmitted ? '2px solid var(--primary-20)' : '2px solid var(--primary-40)',
            borderRadius: 'var(--inner-border-radius)',
            color: hasSubmitted ? 'var(--primary-40)' : 'var(--primary-80)',
            outline: 'none',
            transition: 'all 0.2s ease',
            cursor: enabled && !hasSubmitted ? 'text' : 'not-allowed',
            opacity: hasSubmitted ? 0.5 : 1,
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            if (!hasSubmitted) {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.backgroundColor = 'var(--primary-5)'
            }
          }}
          onBlur={(e) => {
            if (!hasSubmitted) {
              e.target.style.borderColor = 'var(--primary-40)'
              e.target.style.backgroundColor = 'var(--primary-10)'
            }
          }}
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!enabled || hasSubmitted || !inputValue.trim()}
        style={{
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 500,
          backgroundColor: hasSubmitted ? 'var(--primary-20)' : 'var(--accent)',
          color: hasSubmitted ? 'var(--primary-40)' : 'var(--secondary-80)',
          border: 'none',
          borderRadius: 'var(--inner-border-radius)',
          cursor: enabled && !hasSubmitted && inputValue.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: hasSubmitted || !inputValue.trim() ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (enabled && !hasSubmitted && inputValue.trim()) {
            e.currentTarget.style.opacity = '0.8'
          }
        }}
        onMouseLeave={(e) => {
          if (enabled && !hasSubmitted && inputValue.trim()) {
            e.currentTarget.style.opacity = '1'
          }
        }}
      >
        {confirmButtonLabel}
      </button>
    </div>
  )
}

export default InfoConfirmationComponent