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

package io.fusion.fusionbackend.service.shacl;

import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.model.shacl.enums.BasicPaths;
import io.fusion.fusionbackend.model.shacl.enums.IfsPaths;
import io.fusion.fusionbackend.model.shacl.enums.NgsiLdPaths;
import io.fusion.fusionbackend.model.shacl.enums.ShaclPaths;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.Triple;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ShaclFactory {

    protected class ShaclFactoryTreeNode {

        private final Node subject;
        private boolean rootNode = true;
        private final Map<BasicPaths, Node> attributes = new HashMap<>();
        private final Set<ShaclFactoryTreeNode> properties = new HashSet<>();

        public ShaclFactoryTreeNode(Node subject) {
            this.subject = subject;
        }

        public Node getSubject() {
            return subject;
        }

        public boolean isRootNode() {
            return rootNode;
        }

        protected void markAsChild() {
            rootNode = false;
        }

        public Optional<Node> getAttribute(BasicPaths attribute) {
            return Optional.ofNullable(attributes.getOrDefault(attribute, null));
        }

        private void addAttribute(Node predicate, Node object) {
            if (predicate.isURI()) {
                ShaclPaths.asEnum(predicate.getURI()).ifPresent(e -> this.attributes.put(e, object));
                NgsiLdPaths.asEnum(predicate.getURI()).ifPresent(e -> this.attributes.put(e, object));
                IfsPaths.asEnum(predicate.getURI()).ifPresent(e -> this.attributes.put(e, object));
            }
        }

        private void addProperty(ShaclFactoryTreeNode node) {
            this.properties.add(node);
            node.markAsChild();
        }

        public String toString(String offset) {
            StringBuilder s = new StringBuilder(offset + "|-<> " + subject + "\n");
            this.attributes.forEach((key, value) ->
                    s.append(offset)
                            .append("| +-")
                            .append(key)
                            .append(": ")
                            .append(value)
                            .append("\n")
            );
            this.properties.forEach(p -> s.append(p.toString("| " + offset)));
            return s.toString();
        }

        @Override
        public String toString() {
            return toString("");
        }

        public Map<BasicPaths, Node> getAttributes() {
            return attributes;
        }

        public Set<ShaclFactoryTreeNode> getProperties() {
            return properties;
        }
    }

    public Set<ShaclShape> graphTriplesToShaclShapes(Graph triples) {
        Set<ShaclFactoryTreeNode> factoryNodes = createSubjects(triples);
        fillProperties(factoryNodes, triples);
        fillAttributes(factoryNodes, triples);
        return factoryNodes.stream()
                .filter(ShaclFactoryTreeNode::isRootNode)
                .map(ShaclMapper::nodeToShaclShape)
                .collect(Collectors.toSet());
    }

    private void fillAttributes(Set<ShaclFactoryTreeNode> factoryNodes, Graph triples) {
        factoryNodes.forEach(subject -> triples.stream()
                .filter(triple -> subject.getSubject().equals(triple.getSubject()))
                .filter(triple -> !ShaclPaths.PROPERTY.getPath().equalsIgnoreCase(triple.getPredicate().toString()))
                .forEach(triple -> subject.addAttribute(triple.getPredicate(), triple.getObject())));
    }

    private void fillProperties(Set<ShaclFactoryTreeNode> factoryNodes, Graph triples) {
        factoryNodes.forEach(subject -> triples.stream()
                .filter(triple -> subject.getSubject().equals(triple.getSubject()))
                .filter(triple -> ShaclPaths.PROPERTY.getPath().equalsIgnoreCase(triple.getPredicate().toString()))
                .forEach(triple ->
                        factoryNodes.stream()
                                .filter(node -> node.getSubject().equals(triple.getObject()))
                                .findAny().ifPresent(subject::addProperty)));
    }

    private Set<ShaclFactoryTreeNode> createSubjects(Graph triples) {
        return triples.stream()
                .map(Triple::getSubject)
                .distinct()
                .map(ShaclFactoryTreeNode::new)
                .collect(Collectors.toSet());
    }

}
