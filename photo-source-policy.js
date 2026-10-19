/* Original files are immutable. This policy never writes storage or changes a saved template. */
(function(root){
'use strict';
const allowed=Object.freeze(['selectExistingPhoto','insertPhotoLayer','replacePhotoWithExistingAsset','cropPhoto','scalePhotoProportionally','repositionPhoto','setPhotoFitMode','lockPhotoLayer','unlockPhotoLayer','moveLayer','resizeLayer','showLayer','hideLayer','lockLayer','unlockLayer']);
const message='Student photos use original pixels only. Proportional sizing and cropping are allowed; AI generation, retouching, background removal, masking, opacity and rotation changes are disabled.';
root.CSMSPhotoSourcePolicy=Object.freeze({version:'2026-10-18',message,allowedActions:allowed,allows:action=>allowed.includes(action),assert(action){if(!allowed.includes(action))throw new Error(message);return true;}});
})(window);
