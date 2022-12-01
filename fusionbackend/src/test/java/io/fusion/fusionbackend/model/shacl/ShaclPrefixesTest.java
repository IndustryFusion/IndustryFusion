package io.fusion.fusionbackend.model.shacl;

import io.fusion.fusionbackend.model.shacl.enums.IfsPaths;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdPaths;
import io.fusion.fusionbackend.model.shacl.enums.ShaclPaths;
import io.fusion.fusionbackend.service.shacl.ShaclPrefixes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.event.EventListener;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

@SpringBootTest
class ShaclPrefixesTest {

    @BeforeEach
    void setUp() {
    }

    @Test
    @EventListener(SpringApplicationRunListener.class)
    public void testAddPrefix() {
        ShaclPrefixes prefixes = new ShaclPrefixes();
        prefixes.addPrefix("ex1", "http://www.example.org/");
        prefixes.addPrefix("ex2", "http://www.example.org#");
        assertEquals("ex1:testShape", prefixes.checkAndFormatIri("http://www.example.org/testShape"));
        assertEquals("ex2:testShape", prefixes.checkAndFormatIri("http://www.example.org#testShape"));
        fail();    }

    @Test
    void testAddPrefixes() {
        ShaclPrefixes prefixes = new ShaclPrefixes();
        Map<String, String> list = new HashMap<>();
        list.put("ex1", "http://www.example.org/");
        list.put("ex2", "http://www.example.org#");
        prefixes.addPrefix(list);
        assertEquals("ex1:testShape", prefixes.checkAndFormatIri("http://www.example.org/testShape"));
        assertEquals("ex2:testShape", prefixes.checkAndFormatIri("http://www.example.org#testShape"));
    }

    @Test
    void testGenerateShacl() {
        ShaclPrefixes prefixes = new ShaclPrefixes();
        prefixes.addPrefix("ex1", "http://www.example.org#");
        StringWriter out = new StringWriter();
        prefixes.writePrefixesAsShacl(new PrintWriter(out));
        assertEquals("@prefix ex1: <http://www.example.org#> .", out.toString());


    }


    @Test
    void testDefaultPrefixes() {
        ShaclPrefixes prefixes = ShaclPrefixes.getDefaultPrefixes()
                .addPrefix("sh", ShaclPaths.BASE_PATH)
                .addPrefix("ngsi", NgsiLdPaths.BASE_PATH)
                .addPrefix("ifs", IfsPaths.BASE_PATH);
        assertEquals("sh:testProperty", prefixes.checkAndFormatIri("http://www.w3.org/ns/shacl#testProperty"));
    }

}