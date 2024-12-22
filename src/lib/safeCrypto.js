// safeCrypto.js
const generateUUID = () => {
    try {
      // First try using native crypto API
      if (window.crypto && window.crypto.getRandomValues) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = window.crypto.getRandomValues(new Uint8Array(1))[0] & 15;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      
      // Fallback to timestamp-based UUID if crypto is not available
      const d = new Date().getTime();
      const d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    } catch (error) {
      console.warn('Falling back to basic UUID generation:', error);
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
  
  export const getMessageId = () => {
    const uuid = generateUUID();
    console.log('Generated message ID:', uuid);
    return uuid;
  };