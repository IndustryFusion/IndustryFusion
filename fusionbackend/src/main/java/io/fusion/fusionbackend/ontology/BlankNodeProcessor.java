/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionbackend.ontology;

import com.github.jsonldjava.utils.JsonUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/* This Class converts JSON-LD export from Apache Jena.
   The NGSI-LD Broker Scorpio can not parse blank nodes as they have local id's.
   This Class remove the blank nodes und reconstruct the deep JSON without links to blank nodes.
* */
public class BlankNodeProcessor {

    public static String linkBlankNodes(String jsonString) throws ParseException, IOException {
        JSONParser parser = new JSONParser();
        JSONObject root = (JSONObject) parser.parse(jsonString);
        JSONArray graph = (JSONArray) root.get("@graph");

        Map<String, JSONObject> blankNodes = new HashMap();

        if (graph == null) {
            graph = new JSONArray();
            graph.add(root);
        }
        System.out.println(blankNodes.keySet());
        if (blankNodes.size() > 0) {
            insertBlankNodes(graph, blankNodes);
        }
        return JsonUtils.toPrettyString(root);
    }

    private static JSONObject insertBlankNodes(JSONObject node, Map<String, JSONObject> blankNodes) {
        String id = (String) node.get("id");
        JSONObject result = node;
        if (id != null && id.startsWith("_:b") && node.size() == 1) {
            if (blankNodes.get(id) == null) {
                throw new IllegalArgumentException("blank node missing: " + id);
            }
            result = blankNodes.remove(id);
        } else {
            for (Object key : node.keySet()) {
                Object nodevalue = node.get(key);
                if (nodevalue instanceof JSONArray) {
                    node.put(key, insertBlankNodes((JSONArray) nodevalue, blankNodes));
                } else if (nodevalue instanceof JSONObject) {
                    node.put(key, insertBlankNodes((JSONObject) nodevalue, blankNodes));
                } else if (nodevalue instanceof String && ((String) nodevalue).startsWith("_:b")) {
                    node.put(key, blankNodes.remove(nodevalue));
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
