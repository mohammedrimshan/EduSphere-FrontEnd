// Advanced Crypto Polyfill for Web Crypto API Compatibility

(function() {
    // Check if crypto is already fully supported
    if (window.crypto && window.crypto.getRandomValues) {
      return;
    }
  
    // Fallback crypto implementation
    const fallbackCrypto = {
      getRandomValues: function(array) {
        // More sophisticated fallback than simple Math.random()
        if (!(array instanceof Uint8Array || 
              array instanceof Uint16Array || 
              array instanceof Uint32Array)) {
          throw new TypeError('Expected Uint8Array, Uint16Array, or Uint32Array');
        }
  
        for (let i = 0; i < array.length; i++) {
          // Use a combination of methods to generate more random values
          array[i] = (
            Math.floor(Math.random() * 256) ^ 
            (Date.now() & 0xFF) ^ 
            (performance.now() & 0xFF)
          ) & ((1 << (array.constructor.BYTES_PER_ELEMENT * 8)) - 1);
        }
  
        return array;
      }
    };
  
    // Prioritize existing crypto methods
    window.crypto = window.crypto || 
                    window.msCrypto || 
                    window.webkitCrypto || 
                    window.mozCrypto || 
                    fallbackCrypto;
  
    // Ensure getRandomValues method exists
    window.crypto.getRandomValues = window.crypto.getRandomValues || 
                                     fallbackCrypto.getRandomValues;
  
    // Add a flag to indicate we're using a polyfill
    window.isUsingCryptoPolyfill = true;
  
    // Optional: Add a warning for developers
    console.warn('Using crypto polyfill. It is recommended to use a modern browser with native Web Crypto API support.');
  })();
  
  // Verify crypto support
  function verifyCryptoSupport() {
    try {
      const testArray = new Uint8Array(32);
      window.crypto.getRandomValues(testArray);
      return true;
    } catch (error) {
      console.error('Crypto support verification failed:', error);
      return false;
    }
  }
  
  // Export verification function if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      verifyCryptoSupport,
      isUsingCryptoPolyfill: window.isUsingCryptoPolyfill
    };
  }