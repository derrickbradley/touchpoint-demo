import {
  React,
  Icons,
  BaseText,
  CustomCard,
  CustomCardRow,
  type CustomModalityComponent,
} from "@nlxai/touchpoint-ui"

// Manually define the component type signature.
type CustomComponent<T = any> = React.FC<{
  data: T;
  conversationHandler: ConversationHandler;
  enabled?: boolean;
}>;

export interface ProductComponentData {
  question?: string;
  products: string | Array<{
    id: string;
    name: string;
    price: string;
    image: string;
  }>;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ProductComponent: CustomComponent<ProductComponentData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  const [hasResponded, setHasResponded] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [hoveredProduct, setHoveredProduct] = React.useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  const selectedColor = '#90EE90';

  React.useEffect(() => {
    console.log('ProductComponent received data:', data);
  }, [data]);

  if (!data || !data.products) {
    const errorMsg = !data ? 'No data received' : 'No products field in data';
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error-primary)' }}>
        <p>Error: {errorMsg}</p>
      </div>
    );
  }

  let products: Array<{id: string, name: string, price: string, image: string}>;
  if (typeof data.products === 'string') {
    try {
      let jsonString = data.products.trim();
      // This more robust parsing handles double-encoded JSON
      try {
        products = JSON.parse(jsonString);
      } catch (e) {
        let attempt = jsonString.replace(/\\"/g, '"');
        if (attempt.startsWith('"') && attempt.endsWith('"')) {
          attempt = attempt.slice(1, -1);
        }
        products = JSON.parse(attempt);
      }
      if (!Array.isArray(products)) throw new Error('Parsed data is not an array.');
    } catch (error) {
      console.error('All JSON parsing strategies failed:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error-primary)' }}>
          <p>Error: Failed to parse products JSON.</p>
        </div>
      );
    }
  } else {
    products = data.products;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error-primary)' }}>
        <p>Error: No valid products found.</p>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!enabled || hasResponded || isConfirming) return;
    setIsConfirming(true);

    setTimeout(() => {
      setHasResponded(true);
      setIsConfirmed(true);

      const selectedProductDetails = selectedProducts
        .map(productId => products.find(p => p.id === productId))
        .filter(p => p != null);

      const selectedProductsContext = {
        selectedProductCount: selectedProducts.length,
        selectedProductIds: selectedProducts,
        selectedProducts: selectedProductDetails
      };

      conversationHandler.sendSlots(
        { addToCart: "elephant" }, // Example slot
        { selectedProducts: selectedProductsContext }
      );
    }, 1200);
  };

  const handleCancel = () => {
    if (!enabled || hasResponded || isConfirming) return;
    setHasResponded(true);

    conversationHandler.sendSlots(
      { addToCart: "cancel" },
      {
        selectedProducts: {
          selectedProductCount: 0,
          selectedProductIds: [],
          selectedProducts: []
        }
      }
    );
  };

  const toggleProductSelection = (productId: string) => {
    if (!enabled || hasResponded || isConfirming) return;

    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isProcessing = isConfirming && !isConfirmed;

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 style={{
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '32px',
        fontWeight: 600,
        color: 'var(--primary-80)',
        lineHeight: 1.4,
      }}>
        {data.question || "Recommended Products"}
      </h2>

      {selectedProducts.length > 0 && (
        <div style={{
          textAlign: 'center',
          backgroundColor: 'rgba(144, 238, 144, 0.1)',
          borderRadius: 'var(--inner-border-radius)',
          border: '1px solid rgba(144, 238, 144, 0.3)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: isConfirming ? '0px' : '60px',
          opacity: isConfirming ? 0 : 1,
          padding: isConfirming ? '0' : '12px',
          margin: isConfirming ? '-20px 0 0 0' : '0',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '14px', color: selectedColor, fontWeight: 500 }}>
            {selectedProducts.length} item{selectedProducts.length === 1 ? '' : 's'} selected
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: isConfirming ? '10px' : '12px', transition: 'gap 0.5s ease' }}>
        {products.map((product, index) => {
          const isSelected = selectedProducts.includes(product.id);
          const isHovered = hoveredProduct === product.id;
          const shouldHide = isConfirming && !isSelected;
          const transitionDelay = isConfirming ? `${index * 60}ms` : '0ms';

          return (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product.id)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              style={{
                maxHeight: shouldHide ? '0px' : '108px',
                opacity: shouldHide ? 0 : 1,
                marginBottom: shouldHide ? '-12px' : '0px',
                transform: isHovered && !isConfirming ? 'translateY(-2px)' : 'translateY(0)',
                transitionProperty: 'max-height, opacity, margin-bottom, transform',
                transitionDuration: '500ms',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
                transitionDelay: transitionDelay,
                cursor: enabled && !hasResponded && !isConfirming ? 'pointer' : 'default',
              }}
            >
              <div style={{
                backgroundColor: 'var(--primary-5)',
                borderRadius: 'var(--outer-border-radius)',
                border: isSelected ? `2px solid ${selectedColor}` : '2px solid transparent',
                boxShadow: isSelected
                  ? (isConfirming ? '0 4px 12px rgba(0,0,0,0.2)' : `0 4px 16px ${selectedColor}33`)
                  : (isHovered && !isConfirming)
                    ? '0 4px 12px rgba(0,0,0,0.15)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 500ms ease, box-shadow 500ms ease, border-color 300ms ease',
                transitionDelay: transitionDelay,
                overflow: 'hidden',
                transform: isConfirming && isSelected ? 'scale(1.02)' : 'scale(1)'
              }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%', minHeight: '76px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: 'var(--inner-border-radius)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--primary-10)', border: isSelected ? `1px solid ${selectedColor}` : 'none', padding: '6px', boxSizing: 'border-box' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'calc(var(--inner-border-radius) - 6px)', filter: isConfirming && isSelected ? 'brightness(1.1) saturate(1.2)' : 'none', transition: 'filter 0.5s ease' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: isSelected ? 600 : 500, color: isSelected ? selectedColor : 'var(--primary-80)', lineHeight: 1.3, transition: 'all 0.5s ease', wordWrap: 'break-word' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: isSelected ? selectedColor : 'var(--primary-80)', transition: 'color 0.2s ease' }}>
                      {product.price}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isSelected && (
                      <div style={{
                        width: isConfirming ? '24px' : '20px', height: isConfirming ? '24px' : '20px',
                        borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: isConfirming ? 'checkmark-celebrate 0.6s ease-out' : 'checkmark-appear 0.3s ease-out',
                        transition: 'all 0.5s ease'
                      }}>
                        <Icons.Check size={isConfirming ? 14 : 12} className="text-white transition-all duration-500 ease" />
                      </div>
                    )}
                    <Icons.ArrowForward
                      size={20}
                      className={`transition-all duration-200 ease-in-out ${isConfirming ? 'opacity-0' : 'opacity-100'} ${isSelected ? 'text-green-300' : isHovered && !isConfirming ? 'text-primary-80' : 'text-primary-40'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes checkmark-appear {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes checkmark-celebrate {
          0% { transform: scale(1); }
          25% { transform: scale(1.3) rotate(5deg); }
          50% { transform: scale(1.1) rotate(-3deg); }
          75% { transform: scale(1.2) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
        <button
          onClick={handleCancel}
          disabled={!enabled || hasResponded || isConfirming}
          style={{
            minWidth: '120px', padding: '12px 24px', fontSize: '16px', fontWeight: 500, backgroundColor: 'transparent',
            color: 'var(--primary-80)', border: '2px solid var(--primary-40)', borderRadius: '24px',
            cursor: enabled && !hasResponded && !isConfirming ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease', fontFamily: 'inherit', opacity: hasResponded || isConfirming ? 0.5 : 1
          }}
        >
          {data.cancelLabel || "No"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={!enabled || hasResponded || isConfirming}
          style={{
            minWidth: '120px', padding: '12px 24px', fontSize: '16px', fontWeight: 500,
            backgroundColor: isConfirmed
              ? 'var(--primary-20)'
              : isProcessing
                ? '#4CAF50'
                : selectedColor,
            color: isConfirmed
              ? 'var(--primary-60)'
              : isProcessing
                ? 'white'
                : '#2D5016',
            border: 'none',
            borderRadius: '24px',
            cursor: enabled && !hasResponded && !isConfirming ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            transform: isProcessing ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isConfirmed
              ? 'none'
              : isProcessing
                ? '0 4px 20px rgba(76, 175, 80, 0.4)'
                : `0 2px 8px ${selectedColor}4d`,
          }}
        >
          {isConfirmed ? "Added to Cart" : isConfirming ? "Processing..." : data.confirmLabel || "Yes"}
        </button>
      </div>
    </div>
  )
}

export default ProductComponent