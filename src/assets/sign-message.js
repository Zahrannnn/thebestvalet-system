/*
 * JavaScript client-side example using jsrsasign
 */

// #########################################################
// #             WARNING   WARNING   WARNING               #
// #########################################################
// #                                                       #
// # This file is intended for demonstration purposes      #
// # only.                                                 #
// #                                                       #
// # It is the SOLE responsibility of YOU, the programmer  #
// # to prevent against unauthorized access to any signing #
// # functions.                                            #
// #                                                       #
// # Organizations that do not protect against un-         #
// # authorized signing will be black-listed to prevent    #
// # software piracy.                                      #
// #                                                       #
// # -QZ Industries, LLC                                   #
// #                                                       #
// #########################################################

/**
 * Depends:
 *     - jsrsasign-latest-all-min.js
 *     - qz-tray.js
 *
 * Steps:
 *
 *     1. Include jsrsasign 10.9.0 into your web page
 *        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/11.1.0/jsrsasign-all-min.js"></script>
 *
 *     2. Update the privateKey below with contents from private-key.pem
 *
 *     3. Include this script into your web page
 *        <script src="path/to/sign-message.js"></script>
 *
 *     4. Remove or comment out any other references to "setSignaturePromise"
 *
 *     5. IMPORTANT: Before deploying to production, copy "jsrsasign-all-min.js"
 *        to the web server.  Don't trust the CDN above to be available.
 */
var privateKey = "-----BEGIN PRIVATE KEY-----\n" +
"MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDFxSTtLVwV4cYF\n" +
"sdXklxdeZLKBqNvYn6lZwIP/KnSZYYV+B1sK5hRv5c2M0CNFVzyNvqjtgm8iTSEf\n" +
"EQ0Bj6K5wpqAsLCok1KjXYi5Y6i/fjFGYKeEYL50FqrcLeLgwEzTQF3HOtyCLWKh\n" +
"6bm45TNHLB1aGURBdsG1w0BmzBhE1PaCFVbZ+tS7Uirw3LX4/tea4IHwjh0ujg1n\n" +
"jCHaDmOZjcytdlV5qOKHPrBkQe7cn1qcHL3HKe9b/IZ55kwD7uk7KKn3zMaCLE3c\n" +
"FZlapx5/GAdCh0v+GcP5yUy4A8oF4Cag2GOtHbBC64jXPMcuzKc4sHqlvEFfsyR+\n" +
"/F0z3sstAgMBAAECggEABIJZdG/tktEmQPB8Uj0wqvYMTOEC/DYtuA5n5Aw9gtbC\n" +
"oqw7wuyaiC+a52xCdZ0G1CuF8f5gls1f5TOwEnpKKUaa27bLnFhZkMB78tAnI5CW\n" +
"woZHI4FKLl7q7+C69MllpwZnbPi2WOB8iHkKA0F0kRmcJLcBQ6XXxlNolz9tiTow\n" +
"iaohS08Gva/9DYClxcsXLWvDCta+PHg2wzTVKnpd5oqn5XyhxcGS8NlBUS5QrzKV\n" +
"X2iPz5mTmDM9E4+/P+sTqgz3cjJF8DIU2Q3U+akj06RGYu9E9iU5o8xegZMoNGO7\n" +
"5lnyIW8lMGncZCVPUfyc1JxOyMFiHADEuU+Vs2p28QKBgQDvuf2/GyXqtNmhqgGQ\n" +
"8fsrinXqeT3VXt2AFM0DtbguypUuDF+iEPNP43uTX7NMJCqng9meKijZvYPUsAH/\n" +
"Iwl8EM5MOGFHpm86sLNGHMBr6o9KYvf5D04Bk+O8zuCAWENXmXDMi733gIvCKq4e\n" +
"vZn5L334t2DGy6QhdKT3yEDZEQKBgQDTMgblUpYHq6FQGWDQvxT7FcfXOVTOxxbV\n" +
"zoLrYIIr6lSWjXegHIobzB46n/e5CIDv6ny8eZo22egM1qSOuVmnvHgtUinmABk9\n" +
"SrSZJJx5T1hKkI2V71IdHBj+H8MVrGx9HyjNrLK/5uZ4P+dd0qZPxRKS4ZueqVLc\n" +
"IuqPm9DwXQKBgQC7CsU/HLGC5USA7KJ4MzWkDU5feeWS24e7bX9gi6J/b7Thzum3\n" +
"C76r8HP00tCUcguN1EQxMffZnBKGGiYUqYO2923e7oaIXwWeJ0xZQgmoqcTPZ1TP\n" +
"UO+uL3ObV1a3DSbN7HykO8wmlnd1MdPVTF4cnL+PFZU+xpjzOY2VfvuJ4QKBgQCT\n" +
"IM7dA2OxhEek3Yks43FiWhIWRcJnKxslZ/CcuWb14RF8sKEd0cQFCXYlsTuKk/n/\n" +
"KYQsaSqd+8BE8WNCaq2ixRGTwSGfMYJjyJ938KFxgW0oxPtd8JNr5B8lKktl1fDe\n" +
"Wc67Ogxs1BbKvvoXyqBCAjCmUrVvGta2tTxjP1GXoQKBgQCv1Gn6V7x5fQxlWbPP\n" +
"mRJWFeh3F69IZq+Ooj0gn6PbXUvbML7+i/ifDtdELEsd0CWr9n/h104R0dYuwIRd\n" +
"W3ckRh3kVN+nv9T3PfB+Hr/2NmrriOuswj3cOsUcB6ZR1Pwl9L2IvMkU+gSGDv0e\n" +
"CAhzAoFp+tExt9GwlwzwB0pHaQ==\n" +
"-----END PRIVATE KEY-----\n";

qz.security.setSignatureAlgorithm("SHA512"); // Since 2.1
qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(privateKey);
            var sig = new KJUR.crypto.Signature({"alg": "SHA512withRSA"});  // Use "SHA1withRSA" for QZ Tray 2.0 and older
            sig.init(pk); 
            sig.updateString(toSign);
            var hex = sig.sign();
            console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
            resolve(stob64(hextorstr(hex)));
        } catch (err) {
            console.error(err);
            reject(err);
        }
    };
});


qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(privateKey);
            var sig = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
            sig.init(pk);
            sig.updateString(toSign);
            var hex = sig.sign();
            resolve(hex);
        } catch (err) {
            reject(err);
        }
    };
}); 