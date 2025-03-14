/**
 * Different Types for an Attachment
 * Can Be:
 *  (1) Scope Document to the Organization's Website
 *  (2) Internal BCAN Resources
 */
enum AttachmentType {
    SCOPE_DOCUMENT,
    SUPPORTING_RESOURCE,
}

/**
 * Attachment Object
 */
export default interface Attachment {
    attachment_name: string,
    url: string,
    type: AttachmentType
}