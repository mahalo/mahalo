/**
 * This module holds the configuration of Mahalo
 */

/**
 * Mahalo's configuration object. It's a simple map that
 * you can read from but also write to.
 * 
 * @alias {config} from mahalo
 */
export var config = {
    /**
     * The tag that will be used for loops
     */
    FOR_TAG: 'FOR',
    SHOW_TAG: 'SHOW',
    ROUTE_TAG: 'ROUTE',
    CLASSES_ATTRIBUTE: 'classes',
    STYLES_ATTRIBUTE: 'styles',
    CONTENT_ATTRIBUTE: 'content',
    MODEL_ATTRIBUTE: 'model',
    LINK_ATTRIBUTE: 'link',
    
    basePath: '/',
    environment: 'development',
    
    dateFormat: 'MM/DD/YYYY hh:mm',
    numberFormat: '1,000.00'
};