package io.fusion.fusionbackend.ontology;

import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import org.apache.jena.ontology.DatatypeProperty;
import org.apache.jena.ontology.EnumeratedClass;
import org.apache.jena.ontology.ObjectProperty;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.vocabulary.XSD;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;

public class OntologyBuilder {

    public OntModel buildAssetTypeTemplateOntology(AssetTypeTemplate assetTypeTemplate) throws IOException {
        String uri ="https://industry-fusion.com/repository/";
        OntModel ontModel = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM);
        //init Ontology
        generateEnumOntology(ontModel, uri);
        ontModel.addSubModel(ATT.m);

        OntClass attClass = ontModel.createClass(uri+"assetTypeTemplate#"+assetTypeTemplate.getId());
        attClass.addProperty(ATT.VERSION, assetTypeTemplate.getVersion().toString())
                .addProperty(ATT.NAME, assetTypeTemplate.getName())
                .addProperty(ATT.DESCRIPTION, assetTypeTemplate.getDescription())
                .addProperty(ATT.IMAGEKEY, assetTypeTemplate.getImageKey());

        assetTypeTemplate.getFieldTargets().stream().forEach(fieldTarget -> {

            OntClass fieldClass = generateFieldOntology(fieldTarget.getField(), uri, ontModel);

            DatatypeProperty fieldProperty = ontModel.createDatatypeProperty(
                    uri + "assetTypeTemplate#" + assetTypeTemplate.getId()+"_"+fieldTarget.getLabel());
            fieldProperty.addDomain(attClass);
            fieldProperty.addRange(XSD.integer);
            fieldProperty.addIsDefinedBy(fieldClass);
            attClass.addProperty(fieldProperty, fieldTarget.getLabel());
        });

        HashMap<String, String> nsPrefix = new HashMap<>();
        nsPrefix.put("", uri);
        nsPrefix.put("field", uri+"fields#");
        nsPrefix.put("assetTypeTemplate", uri+"assetTypeTemplate#");
        nsPrefix.put("att", "https://industry-fusion.com/ATT-syntax/1.0#");
        ontModel.setNsPrefixes(nsPrefix);

        return ontModel;
    }

    private static void generateEnumOntology(OntModel ontModel, String uri){
        LinkedList<RDFNode> rdfNodes = new LinkedList<>();
        Arrays.stream(FieldThresholdType.values()).forEach(fieldThresholdType -> {
            rdfNodes.add(ontModel.createProperty(uri+"fields#", fieldThresholdType.toString()));
        });
        RDFList thresholdTypeList = ontModel.createList(rdfNodes.iterator());
        EnumeratedClass enumeratedClassFieldThresholdType = ontModel.createEnumeratedClass(uri+"fields#ThresholdType", thresholdTypeList);
    }

    private static OntClass generateFieldOntology(Field field, String uri, OntModel ontModel){

        OntClass fieldClass = ontModel.createClass(uri + "fields#" + field.getId());
        ObjectProperty hasThresholdProperty = ontModel.createObjectProperty(uri+"fields#hasThreshold");
        hasThresholdProperty.addDomain(fieldClass);
        hasThresholdProperty.addRange(ontModel.getOntClass(uri+"fields#ThresholdType"));
        fieldClass.addProperty(hasThresholdProperty, ontModel.getProperty(uri+"fields#", field.getThresholdType().toString()));

        ObjectProperty accuracy = ontModel.createObjectProperty(uri+"fields#accuracy");
        hasThresholdProperty.addDomain(fieldClass);
        hasThresholdProperty.addRange(XSD.xdouble);
        fieldClass.addProperty(accuracy, field.getAccuracy().toString());

        ObjectProperty name = ontModel.createObjectProperty(uri+"fields#name");
        hasThresholdProperty.addDomain(fieldClass);
        hasThresholdProperty.addRange(XSD.xstring);
        fieldClass.addProperty(name, field.getName());

        ObjectProperty description = ontModel.createObjectProperty(uri+"fields#description");
        hasThresholdProperty.addDomain(fieldClass);
        hasThresholdProperty.addRange(XSD.xstring);
        fieldClass.addProperty(description, field.getDescription());

        return fieldClass;
    }

    public static void writeOwlOntologyModelToStreamUsingJena(OntModel ontModel, OutputStream outputStream) throws IOException {

        org.apache.jena.rdf.model.RDFWriterI w = ontModel.getWriter("turtle");

        w.setProperty("attributeQuoteChar","\"");
        w.setProperty("showXMLDeclaration","true");
        w.setProperty("tab","1");

        String base = ontModel.getNsPrefixURI("").substring(0, ontModel.getNsPrefixURI("").length() - 1);
        w.setProperty("xmlbase", base);
        w.write(ontModel, outputStream, base);

        outputStream.flush();

    }
}
