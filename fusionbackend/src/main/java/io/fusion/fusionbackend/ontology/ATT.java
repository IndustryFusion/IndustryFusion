package io.fusion.fusionbackend.ontology;

import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;

public class ATT {

    /**
     * The basic Ontology of an AssetTypeTemplate
     */
    public static final String uri = "https://industry-fusion.com/ATT-syntax/1.0#";
    public static final Model m = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
    public static final Property ID = m.createProperty(uri, "id");
    public static final Property VERSION = m.createProperty(uri, "version");
    public static final Property NAME = m.createProperty(uri, "name");
    public static final Property DESCRIPTION = m.createProperty(uri, "description");
    public static final Property IMAGEKEY = m.createProperty(uri, "imageKey");
    public static final Property ASSETTYPE = m.createProperty(uri, "assetType");
    public static final Property FIELDTYPE = m.createProperty(uri, "fieldType");

    /**
     * returns the URI for this schema
     *
     * @return the URI for this schema
     */
    public static String getURI() {
        return uri;
    }
}
