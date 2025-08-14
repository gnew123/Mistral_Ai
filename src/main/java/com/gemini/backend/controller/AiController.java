package com.gemini.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AiController {

    private final String MISTRAL_API_KEY = "FFFlOdnMbjTHxdWlZoAYkjDzsezfNWCh";
    private final String MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody String userMessage) {
        try {
            if (userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message cannot be empty");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + MISTRAL_API_KEY);

            String requestBody = String.format(
                    "{ \"model\": \"mistral-small-latest\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}] }",
                    userMessage.replace("\"", "\\\"")
            );

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.postForObject(MISTRAL_URL, entity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);
            String aiText = jsonNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            return ResponseEntity.ok(aiText.trim());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
