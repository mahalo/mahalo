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
     * The selector that will be used to select elements that
     * should use the [[mahalo.For]] component.
     */
    FOR_SELECTOR: 'for',

    /**
     * The selector that will be used to select elements that
     * should use the [[mahalo.Show]] component.
     */
    SHOW_SELECTOR: 'show',
    
    /**
     * The selector that will be used to select elements that
     * should represent a [[mahalo.Route]].
     */
    ROUTE_SELECTOR: 'route',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Classes]]
     * behavior to elements with that attribute.
     */
    CLASSES_ATTRIBUTE: 'classes',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Styles]]
     * behavior to elements with that attribute.
     */
    STYLES_ATTRIBUTE: 'styles',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Content]]
     * behavior to elements with that attribute.
     */
    CONTENT_ATTRIBUTE: 'content',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Model]]
     * behavior to elements with that attribute.
     */
    MODEL_ATTRIBUTE: 'model',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Link]]
     * behavior to elements with that attribute.
     */
    LINK_ATTRIBUTE: 'link',
    
    /**
     * The path to your application where '/' is the web root.
     */
    basePath: '/',

    /**
     * 
     */
    environment: 'development',
    
    /**
     * The default format for dates if no other is specified.
     */
    dateFormat: 'MM/DD/YYYY hh:mm',

    /**
     * The default format for numbers.
     */
    numberFormat: '1,000.00'
};