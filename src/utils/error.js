/**
 * Created by artem on 22/01/2017.
 */
 const Locale = require('./errorMessageLocale');
 const logger = require('./logger');
 
 class ErrorBuilder extends Error {
     constructor() {
         super();
         this.code = '';
         this.message = '';
         this.params = null;
         return this;
     }
 
     setCode(code) {
         this.code = code;
         logger.error(`Error with code: ${code}`);
         return this;
     }
 
     setMessage(message) {
         try {
             this.message = Locale.appLocalize.translate(message);
         } catch (err) {
             this.message = message;
         }
         logger.error(`Error with message: ${this.message}`);
         return this;
     }
 
     setParams(params) {
         this.params = params;
         logger.error(`Error with params: ${params}`);
         return this;
     }
 
     build() {
         const newVar = {};
         newVar.code = this.code;
         newVar.message = this.message;
 
         if (this.params != null) newVar.params = this.params;
 
         return newVar;
     }
 }
 
 module.exports = ErrorBuilder;
 