import {
  React,
  Icons,
} from "@nlxai/touchpoint-ui"
import type { CustomComponent } from '../custom-component-types';

export interface OrderSummaryData {
  order: {
    orderId: string;
    customerId: string;
    status: string;
    items: Array<{
      itemId: string;
      orderItemId: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      customizations?: string[];
      specialInstructions?: string;
      sizeName?: string;
      description?: string;
    }>;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    paymentMethod?: {
      type: string;
      cardNumber?: string;
      cardholderName?: string;
    };
    orderType: string;
    restaurant?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    estimatedReadyTime?: string | null;
    createdAt: string;
  };
  queryInfo?: {
    queriedBy: string;
    orderId?: string;
    customerId?: string;
  };
}

// McDonald's brand colors
const McDonaldsColors = {
  red: '#DA020E',
  yellow: '#FFC72C',
  darkRed: '#B8000C',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
  white: '#FFFFFF',
  green: '#27AE60'
};

const OrderSummary: CustomComponent<OrderSummaryData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  React.useEffect(() => {
    console.log('OrderSummary received data:', data);
  }, [data]);

  if (!data || !data.order) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: McDonaldsColors.red,
        backgroundColor: McDonaldsColors.lightGray,
        borderRadius: '12px',
        border: `2px solid ${McDonaldsColors.red}`
      }}>
        <div style={{ marginBottom: '8px', color: McDonaldsColors.red }}>
          <Icons.Warning size={24} />
        </div>
        <p>Unable to load order information</p>
      </div>
    );
  }

  const { order } = data;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasMultipleItems = order.items.length > 1;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order_started':
        return McDonaldsColors.yellow;
      case 'order_placed':
        return McDonaldsColors.green;
      case 'preparing':
        return McDonaldsColors.red;
      case 'ready':
        return McDonaldsColors.green;
      default:
        return McDonaldsColors.darkGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order_started':
        return <Icons.Time size={16} />;
      case 'order_placed':
        return <Icons.Check size={16} />;
      case 'preparing':
        return <Icons.Time size={16} />;
      case 'ready':
        return <Icons.Check size={16} />;
      default:
        return <Icons.Help size={16} />;
    }
  };

  const handleToggleExpand = () => {
    if (!enabled) return;
    setIsExpanded(!isExpanded);
    setHasInteracted(true);
  };

  const handleModifyOrder = () => {
    if (!enabled || hasInteracted) return;
    setHasInteracted(true);
    conversationHandler.sendSlots(
      { modifyOrder: "true" },
      { orderId: order.orderId }
    );
  };

  const handleTrackOrder = () => {
    if (!enabled || hasInteracted) return;
    setHasInteracted(true);
    conversationHandler.sendSlots(
      { trackOrder: "true" },
      { orderId: order.orderId }
    );
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: McDonaldsColors.white,
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: `3px solid ${McDonaldsColors.red}`,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* McDonald's Header */}
      <div style={{
        background: `linear-gradient(135deg, ${McDonaldsColors.red} 0%, ${McDonaldsColors.darkRed} 100%)`,
        padding: '16px',
        color: McDonaldsColors.white,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          backgroundColor: McDonaldsColors.yellow,
          color: McDonaldsColors.darkGray,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          #{order.orderId.slice(-6).toUpperCase()}
        </div>
        
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '4px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          🍟 McDonald's Order
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          {getStatusIcon(order.status)}
          <span style={{
            backgroundColor: getStatusColor(order.status),
            color: order.status.toLowerCase() === 'order_started' ? McDonaldsColors.darkGray : McDonaldsColors.white,
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order Content */}
      <div style={{ padding: '16px' }}>
        {/* Key Order Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            backgroundColor: McDonaldsColors.lightGray,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: McDonaldsColors.red 
            }}>
              {itemCount}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: McDonaldsColors.darkGray 
            }}>
              Item{itemCount !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div style={{
            backgroundColor: McDonaldsColors.lightGray,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: McDonaldsColors.green 
            }}>
              ${order.total.toFixed(2)}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: McDonaldsColors.darkGray 
            }}>
              Total
            </div>
          </div>
        </div>

        {/* Main Item(s) Preview */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: McDonaldsColors.yellow,
            color: McDonaldsColors.darkGray,
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${McDonaldsColors.red}`
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              🍔 Your Order:
            </div>
            
            {order.items.slice(0, 2).map((item, index) => (
              <div key={item.orderItemId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: index < 1 && order.items.length > 1 ? '6px' : '0'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>
                    {item.quantity}x {item.name}
                  </div>
                  {item.customizations && item.customizations.length > 0 && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: McDonaldsColors.darkRed,
                      fontStyle: 'italic'
                    }}>
                      + {item.customizations.join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontWeight: 'bold',
                  color: McDonaldsColors.green,
                  fontSize: '13px'
                }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            {order.items.length > 2 && (
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '12px',
                fontStyle: 'italic',
                color: McDonaldsColors.darkRed
              }}>
                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Order Type & Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: McDonaldsColors.lightGray,
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <div style={{ color: McDonaldsColors.red }}>
            <Icons.Location size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: McDonaldsColors.darkGray }}>
              {order.orderType.replace('-', ' ').toUpperCase()}
            </div>
            {order.restaurant && (
              <div style={{ color: McDonaldsColors.darkGray, fontSize: '11px' }}>
                {order.restaurant.city}, {order.restaurant.state}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px'
        }}>
          <button
            onClick={handleToggleExpand}
            disabled={!enabled}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isExpanded ? McDonaldsColors.darkGray : McDonaldsColors.yellow,
              color: isExpanded ? McDonaldsColors.white : McDonaldsColors.darkGray,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: enabled ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              opacity: enabled ? 1 : 0.6
            }}
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
          
          <button
            onClick={handleModifyOrder}
            disabled={!enabled || hasInteracted}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: McDonaldsColors.red,
              color: McDonaldsColors.white,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: enabled && !hasInteracted ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              opacity: enabled && !hasInteracted ? 1 : 0.6
            }}
          >
            Modify Order
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: McDonaldsColors.lightGray,
            borderRadius: '8px',
            border: `1px solid ${McDonaldsColors.yellow}`
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '12px',
              color: McDonaldsColors.red,
              fontSize: '14px'
            }}>
              📋 Order Details
            </div>
            
            {/* Full Item List */}
            {order.items.map((item, index) => (
              <div key={item.orderItemId} style={{
                padding: '8px 0',
                borderBottom: index < order.items.length - 1 ? `1px solid ${McDonaldsColors.yellow}` : 'none'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '13px',
                      color: McDonaldsColors.darkGray
                    }}>
                      {item.quantity}x {item.name}
                    </div>
                    {item.sizeName && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: McDonaldsColors.darkGray,
                        fontStyle: 'italic'
                      }}>
                        Size: {item.sizeName}
                      </div>
                    )}
                    {item.customizations && item.customizations.length > 0 && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: McDonaldsColors.darkRed,
                        marginTop: '2px'
                      }}>
                        Customizations: {item.customizations.join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: McDonaldsColors.darkRed,
                        fontStyle: 'italic',
                        marginTop: '2px'
                      }}>
                        Special: {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    fontWeight: 'bold',
                    color: McDonaldsColors.green,
                    fontSize: '13px',
                    marginLeft: '8px'
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            {/* Price Breakdown */}
            <div style={{ marginTop: '12px', paddingTop: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: McDonaldsColors.darkGray,
                marginBottom: '4px'
              }}>
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: McDonaldsColors.darkGray,
                marginBottom: '4px'
              }}>
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.tip > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: McDonaldsColors.darkGray,
                  marginBottom: '4px'
                }}>
                  <span>Tip:</span>
                  <span>${order.tip.toFixed(2)}</span>
                </div>
              )}
              <hr style={{ 
                border: `1px solid ${McDonaldsColors.yellow}`, 
                margin: '8px 0' 
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 'bold',
                color: McDonaldsColors.green
              }}>
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            {order.paymentMethod && (
              <div style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: McDonaldsColors.white,
                borderRadius: '6px',
                border: `1px solid ${McDonaldsColors.yellow}`
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: McDonaldsColors.darkGray,
                  marginBottom: '4px'
                }}>
                  💳 Payment Method
                </div>
                <div style={{ fontSize: '11px', color: McDonaldsColors.darkGray }}>
                  {order.paymentMethod.type.replace('_', ' ')}
                  {order.paymentMethod.cardNumber && (
                    <span> - {order.paymentMethod.cardNumber}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
