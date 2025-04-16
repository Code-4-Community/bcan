"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Different Types for an Attachment
 * Can Be:
 *  (1) Scope Document to the Organization's Website
 *  (2) Internal BCAN Resources
 */
var AttachmentType;
(function (AttachmentType) {
    AttachmentType[AttachmentType["SCOPE_DOCUMENT"] = 0] = "SCOPE_DOCUMENT";
    AttachmentType[AttachmentType["SUPPORTING_RESOURCE"] = 1] = "SUPPORTING_RESOURCE";
})(AttachmentType || (AttachmentType = {}));
