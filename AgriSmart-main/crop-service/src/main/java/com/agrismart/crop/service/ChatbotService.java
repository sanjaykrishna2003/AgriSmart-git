package com.agrismart.crop.service;

import com.agrismart.crop.dto.ChatbotRequest;
import com.agrismart.crop.dto.ChatbotResponse;
import com.agrismart.crop.dto.ChatMessageDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class ChatbotService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public ChatbotResponse getReply(ChatbotRequest request) {
        String msg = request.getMessage() != null ? request.getMessage() : "";
        String lang = request.getLanguage() != null ? request.getLanguage() : "en";

        // 1. If Gemini API Key is configured, attempt calling Google Gemini
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                RestClient restClient = RestClient.builder()
                        .baseUrl("https://generativelanguage.googleapis.com")
                        .build();

                // Format Gemini payload matching API spec with system instructions and chat history
                StringBuilder promptBuilder = new StringBuilder();
                
                promptBuilder.append("You are AgriSmart AI assistant, a highly experienced agronomist. ");
                if (request.getFarmerName() != null && !request.getFarmerName().trim().isEmpty()) {
                    promptBuilder.append(String.format("You are talking to farmer '%s'. ", request.getFarmerName()));
                }
                if (request.getDistrict() != null && !request.getDistrict().trim().isEmpty()) {
                    promptBuilder.append(String.format("Their farm is located in district '%s', state '%s'. ", request.getDistrict(), request.getState()));
                }
                if (request.getSoilType() != null && !request.getSoilType().trim().isEmpty()) {
                    promptBuilder.append(String.format("Their primary soil type is '%s'. ", request.getSoilType()));
                }
                if (request.getActiveCrops() != null && !request.getActiveCrops().isEmpty()) {
                    promptBuilder.append(String.format("They are currently cultivating these crops: %s. ", String.join(", ", request.getActiveCrops())));
                }
                
                promptBuilder.append(String.format("Respond briefly (max 4-5 sentences) and in language code '%s'.\n\n", lang));
                
                if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                    promptBuilder.append("Conversation History:\n");
                    for (ChatMessageDto chatMsg : request.getHistory()) {
                        String speaker = "user".equalsIgnoreCase(chatMsg.getSender()) ? "Farmer" : "Assistant";
                        promptBuilder.append(String.format("%s: %s\n", speaker, chatMsg.getText()));
                    }
                    promptBuilder.append("\n");
                }
                
                promptBuilder.append("Farmer: ").append(msg).append("\nAssistant:");

                Map<String, Object> textPart = new HashMap<>();
                textPart.put("text", promptBuilder.toString());

                Map<String, Object> partsMap = new HashMap<>();
                partsMap.put("parts", Collections.singletonList(textPart));

                Map<String, Object> contentsMap = new HashMap<>();
                contentsMap.put("contents", Collections.singletonList(partsMap));

                Map<String, Object> responseData = restClient.post()
                        .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(contentsMap)
                        .retrieve()
                        .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

                if (responseData != null && responseData.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseData.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            String textReply = (String) parts.get(0).get("text");
                            return new ChatbotResponse(textReply.trim());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API call failed, falling back to local matching: " + e.getMessage());
            }
        }

        // 2. Fallback to Local Multilingual Rule-based Agronomist Chatbot
        String msgLower = msg.toLowerCase(Locale.ROOT);
        String reply = "";

        // Crop Database specific lookups
        if (msgLower.contains("rice") || msgLower.contains("paddy") || msgLower.contains("धान")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "धान (Rice): पानी: 1500-2500 मिमी; उर्वरक (NPK): 120:60:60 किग्रा/हेक्टेयर; जलवायु: गर्म और आर्द्र (22-32°C); परिपक्वता समय: 120 दिन; प्रमुख जोखिम: झोंका रोग (Blast), तना छेदक (Stem Borer), और भारी वर्षा/जलभराव।";
            } else {
                reply = "Rice (Paddy): Water needed: 1500-2500 mm; Fertilizers: NPK 120:60:60 kg/ha; Climate: Hot and humid (22-32°C); Duration: 120 days; Risks: Blast disease, Stem Borer, and waterlogging/floods.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("wheat") || msgLower.contains("गेहूं") || msgLower.contains("ਕਣਕ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "गेहूं (Wheat): पानी: 450-650 मिमी; उर्वरक (NPK): 120:50:40 किग्रा/हेक्टेयर; जलवायु: ठंडी और शुष्क (10-25°C); परिपक्वता समय: 130 दिन; प्रमुख जोखिम: पीला गेरूआ रोग (Yellow Rust), चेपा (Aphids), और गर्मी का अचानक बढ़ना (Terminal Heat).";
            } else {
                reply = "Wheat: Water needed: 450-650 mm; Fertilizers: NPK 120:50:40 kg/ha; Climate: Cool and dry (10-25°C); Duration: 130 days; Risks: Yellow/Leaf Rust, Loose Smut, and terminal heat stress at grain filling.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("maize") || msgLower.contains("corn") || msgLower.contains("मक्का") || msgLower.contains("ਮੱਕੀ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "मक्का (Maize): पानी: 500-800 मिमी; उर्वरक (NPK): 120:60:40 किग्रा/हेक्टेयर; जलवायु: गर्म (21-27°C); परिपक्वता समय: 100 दिन; प्रमुख जोखिम: फॉल आर्मीवर्म (Fall Armyworm), तना छेदक, और फूल आने के समय सूखा।";
            } else {
                reply = "Maize (Corn): Water needed: 500-800 mm; Fertilizers: NPK 120:60:40 kg/ha; Climate: Warm (21-27°C); Duration: 100 days; Risks: Fall Armyworm, Downy Mildew, and dry spells during silking.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("sugarcane") || msgLower.contains("गन्ना") || msgLower.contains("ਗੰਨਾ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "गन्ना (Sugarcane): पानी: 1500-3000 मिमी; उर्वरक (NPK): 275:75:110 किग्रा/हेक्टेयर; जलवायु: उष्णकटिबंधीय गर्म और आर्द्र (20-35°C); परिपक्वता समय: 365 दिन (वार्षिक); प्रमुख जोखिम: लाल सड़न रोग (Red Rot), सफेद मक्खी, और पाला।";
            } else {
                reply = "Sugarcane: Water needed: 1500-3000 mm; Fertilizers: NPK 275:75:110 kg/ha; Climate: Tropical warm and humid (20-35°C); Duration: 365 days; Risks: Red Rot disease, White Fly, and frost damage.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("cotton") || msgLower.contains("कपास") || msgLower.contains("ਨਰਮਾ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "कपास (Cotton): पानी: 700-1300 मिमी; उर्वरक (NPK): 80:40:40 किग्रा/हेक्टेयर; जलवायु: गर्म और शुष्क (21-30°C); परिपक्वता समय: 150 दिन; प्रमुख जोखिम: गुलाबी सुंडी (Pink Bollworm), जैसिड्स, और गूलर फटने के समय वर्षा।";
            } else {
                reply = "Cotton: Water needed: 700-1300 mm; Fertilizers: NPK 80:40:40 kg/ha; Climate: Warm and dry (21-30°C); Duration: 150 days; Risks: Pink Bollworm, Jassids, Boll Rot, and rains during harvest.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("groundnut") || msgLower.contains("मूंगफली") || msgLower.contains("ਮੂੰਗਫਲੀ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "मूंगफली (Groundnut): पानी: 450-650 मिमी; उर्वरक (NPK): 20:40:40 किग्रा/हेक्टेयर; जलवायु: गर्म (21-30°C); परिपक्वता समय: 115 दिन; प्रमुख जोखिम: टिक्का रोग (Tikka Leaf Spot), कॉलर रॉट (Collar Rot), और कैल्शियम की कमी से खाली फली बनना।";
            } else {
                reply = "Groundnut: Water needed: 450-650 mm; Fertilizers: NPK 20:40:40 kg/ha; Climate: Warm (21-30°C); Duration: 115 days; Risks: Tikka Leaf Spot, Collar Rot, and poor pod filling due to calcium deficiency.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("tomato") || msgLower.contains("टमाटर") || msgLower.contains("ਟਮਾਟਰ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "टमाटर (Tomato): पानी: 400-600 मिमी; उर्वरक (NPK): 100:60:60 किग्रा/हेक्टेयर; जलवायु: मध्यम गर्म (21-24°C); परिपक्वता समय: 90 दिन; प्रमुख जोखिम: अगेती/पछेती झुलसा रोग (Blight), फल छेदक (Fruit Borer), और पाला।";
            } else {
                reply = "Tomato: Water needed: 400-600 mm; Fertilizers: NPK 100:60:60 kg/ha; Climate: Warm (21-24°C); Duration: 90 days; Risks: Early/Late Blight, Tomato Fruit Borer, Leaf Curl Virus, and frost.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("mustard") || msgLower.contains("सरसों") || msgLower.contains("ਸਰ੍ਹੋਂ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "सरसों (Mustard): पानी: 250-400 मिमी; उर्वरक (NPK): 80:40:40 किग्रा/हेक्टेयर; जलवायु: ठंडी और शुष्क (10-25°C); परिपक्वता समय: 110 दिन; प्रमुख जोखिम: अल्टरनेरिया ब्लाइट, सरसों का चेपा (Aphids), और पाला।";
            } else {
                reply = "Mustard: Water needed: 250-400 mm; Fertilizers: NPK 80:40:40 kg/ha; Climate: Cool (10-25°C); Duration: 110 days; Risks: Alternaria Blight, Mustard Aphids, and frost during flowering.";
            }
            return new ChatbotResponse(reply);
        }
        if (msgLower.contains("potato") || msgLower.contains("आलू") || msgLower.contains("ਆਲੂ")) {
            if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
                reply = "आलू (Potato): पानी: 350-500 मिमी; उर्वरक (NPK): 120:100:120 किग्रा/हेक्टेयर; जलवायु: ठंडी जलवायु (रात का तापमान < 20°C); परिपक्वता समय: 100 दिन; प्रमुख जोखिम: पछेती झुलसा रोग (Late Blight), आलू कंद कीट (Tuber Moth), और पाला।";
            } else {
                reply = "Potato: Water needed: 350-500 mm; Fertilizers: NPK 120:100:120 kg/ha; Climate: Cool weather; Duration: 100 days; Risks: Late Blight (highly destructive), Potato Tuber Moth, and frost.";
            }
            return new ChatbotResponse(reply);
        }

        if (lang.toLowerCase(Locale.ROOT).equals("hi")) {
            if (msgLower.contains("fertilizer") || msgLower.contains("npk") || msgLower.contains("urea") || msgLower.contains("fertiliser") || msgLower.contains("उर्वरक") || msgLower.contains("खाद")) {
                reply = "उर्वरक (NPK) का उपयोग फसल के चरण के अनुसार करें। धान के लिए: 120:60:60 N:P:K मानक है। यूरिया को तीन भागों में बांटकर डालें (रोपाई, कल्ले फूटते समय, और बालियां बनते समय)। मिट्टी परीक्षण के आधार पर ही संतुलित मात्रा तय करें।";
            } else if (msgLower.contains("weather") || msgLower.contains("rain") || msgLower.contains("forecast") || msgLower.contains("मौसम") || msgLower.contains("बारिश")) {
                reply = "हमेशा 3 दिनों के मौसम पूर्वानुमान की जांच करें। यदि भारी वर्षा (>5 मिमी) की संभावना हो, तो सिंचाई और कीटनाशक छिड़काव स्थगित कर दें ताकि रसायन बहने से बच सकें और पानी का भराव न हो।";
            } else if (msgLower.contains("yield") || msgLower.contains("harvest") || msgLower.contains("optimize") || msgLower.contains("पैदावार") || msgLower.contains("फसल")) {
                reply = "पैदावार बढ़ाने के लिए, प्रमाणित रोग-प्रतिरोधी बीजों (जैसे गेहूं के लिए HD-2967, धान के लिए CR-Dhan) का चयन करें और मिट्टी में सुधार के लिए हरी खाद या दालों के साथ फसल चक्र अपनाएं।";
            } else if (msgLower.contains("disease") || msgLower.contains("pest") || msgLower.contains("insect") || msgLower.contains("बीमारी") || msgLower.contains("कीड़ा")) {
                reply = "सामान्य बीमारियों में धान का झोंका रोग (Tricyclazole से उपचार) और गेहूं का गेरूआ रोग (Propiconazole से उपचार) शामिल हैं। जल निकासी अच्छी रखें और कीड़ों की रोकथाम के लिए नीम के तेल का छिड़काव करें।";
            } else {
                reply = "नमस्कार! मैं आपका एग्रीस्मार्ट एआई सहायक हूँ। मुझसे फसल चयन, उर्वरक (NPK) की मात्रा, मौसम की चेतावनी या पैदावार बढ़ाने के बारे में पूछें।";
            }
        } else if (lang.toLowerCase(Locale.ROOT).equals("pb") || lang.toLowerCase(Locale.ROOT).equals("pun")) {
            if (msgLower.contains("fertilizer") || msgLower.contains("npk") || msgLower.contains("urea") || msgLower.contains("fertiliser") || msgLower.contains("ਖਾਦ")) {
                reply = "ਖਾਦ (NPK) ਦੀ ਵਰਤੋਂ ਫਸਲ ਦੇ ਪੜਾਅ ਅਨੁਸਾਰ ਕਰੋ। ਝੋਨੇ ਲਈ: 120:60:60 N:P:K ਮਿਆਰੀ ਹੈ। ਯੂਰੀਆ ਨੂੰ ਤਿੰਨ ਬਰਾਬਰ ਹਿੱਸਿਆਂ ਵਿੱਚ ਪਾਓ (ਰੋਪਾਈ, ਕੱਲ੍ਹੇ ਫੁੱਟਣ ਵੇਲੇ, ਅਤੇ ਨਿਸਾਰੇ ਵੇਲੇ)।";
            } else if (msgLower.contains("weather") || msgLower.contains("rain") || msgLower.contains("forecast") || msgLower.contains("ਮੌਸਮ") || msgLower.contains("ਮੀਂਹ")) {
                reply = "ਹਮੇਸ਼ਾ 3 ਦਿਨਾਂ ਦੇ ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ ਦੇਖੋ। ਜੇਕਰ ਭਾਰੀ ਮੀਂਹ (>5 ਮਿਲੀਮੀਟਰ) ਦੀ ਸੰਭਾਵਨਾ ਹੈ, ਤਾਂ ਸਿੰਚਾਈ ਅਤੇ ਕੀਟਨਾਸ਼ਕਾਂ ਦਾ ਛਿੜਕਾਅ ਰੋਕ ਦਿਓ ਤਾਂ ਜੋ ਖਾਦ ਜਾਂ ਦਵਾਈ ਖਰਾਬ ਨਾ ਹੋਵੇ।";
            } else if (msgLower.contains("yield") || msgLower.contains("harvest") || msgLower.contains("optimize") || msgLower.contains("ਝਾੜ") || msgLower.contains("ਫਸਲ")) {
                reply = "ਝਾੜ ਵਧਾਉਣ ਲਈ, ਬਿਮਾਰੀ-ਰੋਧਕ ਬੀਜਾਂ (ਜਿਵੇਂ ਕਣਕ ਲਈ HD-2967, ਝੋਨੇ ਲਈ CR-Dhan) ਦੀ ਚੋਣ ਕਰੋ ਅਤੇ ਫਸਲੀ ਚੱਕਰ ਵਿੱਚ ਜੰਤਰ ਜਾਂ ਦਾਲਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ ਤਾਂ ਜੋ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਬਣੀ ਰਹੇ।";
            } else if (msgLower.contains("disease") || msgLower.contains("pest") || msgLower.contains("insect") || msgLower.contains("ਬਿਮਾਰੀ") || msgLower.contains("ਕੀੜੇ")) {
                reply = "ਆਮ ਬਿਮਾਰੀਆਂ ਵਿੱਚ ਝੋਨੇ ਦਾ ਬਲਾਸਟ (Tricyclazole ਨਾਲ ਇਲਾਜ) ਅਤੇ ਕਣਕ ਦੀ ਕੁੰਗੀ (Propiconazole ਨਾਲ ਇਲਾਜ) ਸ਼ਾਮਲ ਹਨ। ਖੇਤ ਵਿੱਚ ਹਵਾ ਅਤੇ ਰੋਸ਼ਨੀ ਦਾ ਢੁਕਵਾਂ ਪ੍ਰਬੰਧ ਰੱਖੋ।";
            } else {
                reply = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਐਗਰੀਸਮਾਰਟ ਏਆਈ ਸਹਾਇਕ ਹਾਂ। ਮੈਨੂੰ ਫਸਲ ਦੀ ਚੋਣ, ਖਾਦਾਂ ਦੀ ਵਰਤੋਂ, ਮੌਸਮ ਦੀ ਚੇਤਾਵਨੀ ਜਾਂ ਝਾੜ ਵਧਾਉਣ ਬਾਰੇ ਪੁੱਛੋ।";
            }
        } else if (lang.toLowerCase(Locale.ROOT).equals("ta")) {
            if (msgLower.contains("fertilizer") || msgLower.contains("npk") || msgLower.contains("urea") || msgLower.contains("fertiliser") || msgLower.contains("உரம்") || msgLower.contains("தழைச்சத்து")) {
                reply = "பயிர் வளர்ச்சிக்கு ஏற்ப உரமிடவும் (N:P:K). நெற்பயிருக்கு: 120:60:60 N:P:K உகந்தது. தழைச்சத்தை (நைட்ரஜன்) அடி உரம், தூர்கள் கட்டும் பருவம், மற்றும் பூங்கொத்து உருவாகும் பருவம் என 3 பிரிவாக பிரித்து இடவும்.";
            } else if (msgLower.contains("weather") || msgLower.contains("rain") || msgLower.contains("forecast") || msgLower.contains("வானிலை") || msgLower.contains("மழை")) {
                reply = "எப்போதும் 3 நாட்களுக்கான வானிலை முன்னறிவிப்பை கவனிக்கவும். கனமழை (>5 மிமீ) எதிர்பார்க்கப்பட்டால், நீர்ப்பாசனம் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை தள்ளிப்போடவும்.";
            } else if (msgLower.contains("yield") || msgLower.contains("harvest") || msgLower.contains("optimize") || msgLower.contains("மகசூல்") || msgLower.contains("அறுவடை")) {
                reply = "அதிக மகசூல் பெற, சான்றளிக்கப்பட்ட நோய் எதிர்ப்பு திறன் கொண்ட விதைகளை தேர்வு செய்யவும். மண்ணின் வளத்தை பெருக்க பயறு வகை பயிர்களுடன் பயிர் சுழற்சி முறை பின்பற்றவும்.";
            } else if (msgLower.contains("disease") || msgLower.contains("pest") || msgLower.contains("insect") || msgLower.contains("நோய்") || msgLower.contains("பூச்சி")) {
                reply = "நெற்பயிரில் குலை நோய் (Tricyclazole மூலம் கட்டுப்படுத்தலாம்) மற்றும் கோதுமையில் துரு நோய் (Propiconazole மூலம் கட்டுப்படுத்தலாம்) பொதுவானவை. வடிகால் வசதியை மேம்படுத்தவும்.";
            } else {
                reply = "வணக்கம்! நான் உங்கள் அக்ரிஸ்மார்ட் AI உதவியாளர். பயிர் தேர்வு, உர மேலாண்மை, வானிலை எச்சரிக்கைகள் அல்லது மகசூல் மேம்பாடு பற்றி என்னிடம் கேட்கலாம்.";
            }
        } else {
            // Default English
            if (msgLower.contains("fertilizer") || msgLower.contains("npk") || msgLower.contains("urea") || msgLower.contains("fertiliser")) {
                reply = "NPK levels should be adjusted depending on crop stage. For rice: 120:60:60 N:P:K is standard. Split nitrogen into 3 doses: basal, tillering, and panicle initiation. Ensure phosphorus is fully applied during sowing.";
            } else if (msgLower.contains("weather") || msgLower.contains("rain") || msgLower.contains("forecast") || msgLower.contains("monsoon")) {
                reply = "Always monitor 3-day weather forecasts. If heavy rainfall (>5mm) is predicted, defer irrigation and pesticide sprays to prevent chemical wash-off and waterlogging.";
            } else if (msgLower.contains("yield") || msgLower.contains("harvest") || msgLower.contains("optimize") || msgLower.contains("predict")) {
                reply = "To maximize yields, select certified disease-resistant seeds (e.g., HD-2967 for wheat, CR-Dhan for rice) and practice crop rotation with legumes like mung bean to replenish soil nitrogen.";
            } else if (msgLower.contains("disease") || msgLower.contains("pest") || msgLower.contains("insect") || msgLower.contains("fungus")) {
                reply = "Common diseases include Blast in rice (treat with Tricyclazole) and Rust in wheat (treat with Propiconazole). Maintain proper drainage and spacing to minimize fungal buildup.";
            } else {
                reply = "Hello! I am your AgriSmart AI assistant. Ask me about crop suitability, NPK fertilizer dosing, weather warnings, or yield optimization.";
            }
        }

        return new ChatbotResponse(reply);
    }
}
