package io.fusion.fusionbackend;

import com.github.jsonldjava.utils.JsonUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class BlankNodeProcessor {


public static String linkBlankNodes(String jsonString) throws ParseException, IOException {
    JSONParser parser = new JSONParser();
    JSONObject root = (JSONObject) parser.parse(jsonString);
    JSONArray graph = (JSONArray) root.get("@graph");
    Map<String, JSONObject> blankNodes = new HashMap();

    removeBlankNodes(graph, blankNodes);
    insertBlankNodes(graph, blankNodes);
    return JsonUtils.toPrettyString(root);
}

    private static JSONArray removeBlankNodes(JSONArray graph, Map<String, JSONObject> blankNodes) {
        for (int i = 0; i < graph.size(); ) {
            JSONObject node = (JSONObject) graph.get(i);
            String id = (String) node.get("id");
            if (id != null && id.startsWith("_:b") && node.size() > 1) {
                JSONObject blankNode = (JSONObject) graph.remove(i);
                blankNode.remove("id");
                blankNodes.put(id, blankNode);
            } else {
                for (Object key : node.keySet()) {
                    Object nodevalue = node.get(key);
                    if (nodevalue instanceof JSONArray) {
                        removeBlankNodes((JSONArray) nodevalue, blankNodes);
                    }
                }
                i++;
            }
        }
        return graph;
    }

    private static JSONObject insertBlankNodes(JSONObject node, Map<String, JSONObject> blankNodes) {
        String id = (String) node.get("id");
        JSONObject result = node;
        if (id != null && id.startsWith("_:b") && node.size() == 1) {
            if (blankNodes.get(id) == null) {
                throw new IllegalArgumentException("blank node missing");
            }
            result = blankNodes.remove(id);
        } else {
            for (Object key : node.keySet()) {
                Object nodevalue = node.get(key);
                if (nodevalue instanceof JSONArray) {
                    node.put(key, insertBlankNodes((JSONArray) nodevalue, blankNodes));
                } else if (nodevalue instanceof JSONObject) {
                    node.put(key, insertBlankNodes((JSONObject)nodevalue, blankNodes));
                } else if (nodevalue instanceof String){
                    if (((String) nodevalue).startsWith("_:b")) {
                        node.put(key, blankNodes.remove(nodevalue));
                    }
                }
            }
        }
        return result;
    }

    private static JSONArray insertBlankNodes(JSONArray graph, Map<String, JSONObject> blankNodes) {
        for (int i = 0; i < graph.size(); i++) {
            JSONObject node = (JSONObject) graph.get(i);
            graph.set(i, insertBlankNodes(node, blankNodes));
        }
        return graph;
    }
}
