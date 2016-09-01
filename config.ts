/**
 * This module holds the configuration of Mahalo
 */

/**
 * Mahalo's configuration object. It's a simple map that
 * you can read from but also write to.
 * 
 * @alias {config} from mahalo
 */
export const config = {
    /**
     * The selector that will be used to select elements that
     * should use the [[mahalo.For]] component.
     */
    forSelector: 'for',

    /**
     * The selector that will be used to select elements that
     * should use the [[mahalo.Show]] component.
     */
    showSelector: 'show',
    
    /**
     * The selector that will be used to select elements that
     * should represent a [[mahalo.Route]].
     */
    routeSelector: 'route',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Classes]]
     * behavior to elements with that attribute.
     */
    classesAttribute: 'classes',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Styles]]
     * behavior to elements with that attribute.
     */
    stylesAttribute: 'styles',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Content]]
     * behavior to elements with that attribute.
     */
    contentAttribute: 'content',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Model]]
     * behavior to elements with that attribute.
     */
    modelAttribute: 'model',
    
    /**
     * The attribute name that will be used to attach the [[mahalo.Link]]
     * behavior to elements with that attribute.
     */
    linkAttribute: 'link',
    
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