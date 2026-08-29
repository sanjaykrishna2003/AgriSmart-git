package com.agrismart.weather.service;

import com.agrismart.weather.dto.FarmResponse;
import com.agrismart.weather.dto.ForecastResponse;
import com.agrismart.weather.dto.UserResponse;
import com.agrismart.weather.dto.WeatherResponse;
import com.agrismart.weather.entity.WeatherHistory;
import com.agrismart.weather.exception.BadRequestException;
import com.agrismart.weather.repository.WeatherHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class WeatherService {

    private final WeatherHistoryRepository weatherHistoryRepository;
    private final RestClient.Builder restClientBuilder;

    @Value("${weather.openweathermap.api-key:}")
    private String openWeatherApiKey;

    @Value("${twilio.account_sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth_token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone_number:}")
    private String twilioPhoneNumber;

    public WeatherService(WeatherHistoryRepository weatherHistoryRepository, RestClient.Builder restClientBuilder) {
        this.weatherHistoryRepository = weatherHistoryRepository;
        this.restClientBuilder = restClientBuilder;
    }

    private RestClient getFarmRestClient() {
        return restClientBuilder.baseUrl("http://localhost:8082").build();
    }

    private FarmResponse fetchFarmDetails(Long farmId, String jwtToken) {
        try {
            return getFarmRestClient().get()
                    .uri("/api/farms/{id}", farmId)
                    .header("Authorization", "Bearer " + jwtToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(FarmResponse.class);
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify farm for weather fetching. Access denied or farm not found.");
        }
    }

    private UserResponse fetchUserDetails(Long userId, String jwtToken) {
        try {
            RestClient userClient = restClientBuilder.baseUrl("http://localhost:8081").build();
            return userClient.get()
                    .uri("/api/users/{id}", userId)
                    .header("Authorization", "Bearer " + jwtToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(UserResponse.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch user details: " + e.getMessage());
            return null;
        }
    }

    @Transactional
    public WeatherResponse fetchCurrentWeather(Long farmId, String jwtToken) {
        FarmResponse farm = fetchFarmDetails(farmId, jwtToken);
        Double lat = farm.getLatitude();
        Double lon = farm.getLongitude();

        if (lat == null || lon == null) {
            throw new BadRequestException("Latitude and Longitude coordinates are not configured for this farm plot. Please edit the farm and set them.");
        }

        WeatherResponse response = null;

        // 1. Primary Source: OpenWeatherMap API
        if (openWeatherApiKey != null && !openWeatherApiKey.isBlank() && !"dummy_api_key".equals(openWeatherApiKey)) {
            try {
                RestClient openWeatherClient = restClientBuilder.baseUrl("https://api.openweathermap.org").build();
                String uri = String.format("/data/2.5/weather?lat=%.4f&lon=%.4f&appid=%s&units=metric", lat, lon, openWeatherApiKey);

                Map<String, Object> weatherData = openWeatherClient.get()
                        .uri(uri)
                        .retrieve()
                        .body(new ParameterizedTypeReference<Map<String, Object>>() {});

                if (weatherData != null && weatherData.containsKey("main")) {
                    Map<String, Object> main = (Map<String, Object>) weatherData.get("main");
                    Double temp = ((Number) main.get("temp")).doubleValue();
                    Double humidity = ((Number) main.get("humidity")).doubleValue();

                    Double rainfall = 0.0;
                    if (weatherData.containsKey("rain")) {
                        Map<String, Object> rainMap = (Map<String, Object>) weatherData.get("rain");
                        if (rainMap.containsKey("1h")) {
                            rainfall = ((Number) rainMap.get("1h")).doubleValue();
                        } else if (rainMap.containsKey("3h")) {
                            rainfall = ((Number) rainMap.get("3h")).doubleValue();
                        }
                    }

                    Double windSpeed = 4.0;
                    if (weatherData.containsKey("wind")) {
                        Map<String, Object> windMap = (Map<String, Object>) weatherData.get("wind");
                        if (windMap.containsKey("speed")) {
                            windSpeed = ((Number) windMap.get("speed")).doubleValue();
                        }
                    }

                    String description = "Clear";
                    if (weatherData.containsKey("weather")) {
                        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) weatherData.get("weather");
                        if (!weatherList.isEmpty()) {
                            description = (String) weatherList.get(0).get("main");
                        }
                    }

                    response = WeatherResponse.builder()
                            .temperature(temp)
                            .humidity(humidity)
                            .rainfall(rainfall)
                            .description(description)
                            .windSpeed(windSpeed)
                            .recordedAt(LocalDateTime.now())
                            .build();
                }
            } catch (Exception e) {
                System.err.println("OpenWeatherMap API call failed, attempting fallback: " + e.getMessage());
            }
        }

        // 2. Secondary Fallback Source: Open-Meteo API
        if (response == null) {
            try {
                RestClient openMeteoClient = restClientBuilder.baseUrl("https://api.open-meteo.com").build();
                String uri = String.format("/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,rain,weather_code&timezone=auto", lat, lon);

                Map<String, Object> openMeteoData = openMeteoClient.get()
                        .uri(uri)
                        .retrieve()
                        .body(new ParameterizedTypeReference<Map<String, Object>>() {});

                if (openMeteoData != null && openMeteoData.containsKey("current")) {
                    Map<String, Object> current = (Map<String, Object>) openMeteoData.get("current");
                    Double temp = ((Number) current.get("temperature_2m")).doubleValue();
                    Double humidity = ((Number) current.get("relative_humidity_2m")).doubleValue();
                    Double rainfall = ((Number) current.get("rain")).doubleValue();
                    int wmoCode = ((Number) current.get("weather_code")).intValue();
                    String description = mapWmoCodeToDescription(wmoCode);

                    response = WeatherResponse.builder()
                            .temperature(temp)
                            .humidity(humidity)
                            .rainfall(rainfall)
                            .description(description)
                            .windSpeed(4.5)
                            .recordedAt(LocalDateTime.now())
                            .build();
                }
            } catch (Exception e) {
                System.err.println("Open-Meteo API call failed, using database history fallback: " + e.getMessage());
            }
        }

        // 3. Tertiary Offline Fallback: Database Weather History / Default Constants
        if (response == null) {
            List<WeatherHistory> historyList = weatherHistoryRepository.findTop10ByFarmIdOrderByRecordedAtDesc(farmId);
            if (!historyList.isEmpty()) {
                WeatherHistory latest = historyList.get(0);
                response = WeatherResponse.builder()
                        .temperature(latest.getTemperature())
                        .humidity(latest.getHumidity())
                        .rainfall(latest.getRainfall())
                        .description(latest.getWeatherCondition() != null ? latest.getWeatherCondition() : "Cloudy")
                        .windSpeed(3.0)
                        .recordedAt(latest.getRecordedAt())
                        .build();
            } else {
                response = WeatherResponse.builder()
                        .temperature(28.0)
                        .humidity(70.0)
                        .rainfall(0.0)
                        .description("Partly Cloudy")
                        .windSpeed(4.0)
                        .recordedAt(LocalDateTime.now())
                        .build();
            }
        }

        // Save recorded weather to database history
        WeatherHistory history = WeatherHistory.builder()
                .temperature(response.getTemperature())
                .humidity(response.getHumidity())
                .rainfall(response.getRainfall())
                .weatherCondition(response.getDescription())
                .farmId(farmId)
                .build();
        weatherHistoryRepository.save(history);

        // SMS Alert Engine for Heavy Rainfall
        if (response.getRainfall() != null && response.getRainfall() > 5.0) {
            UserResponse user = fetchUserDetails(farm.getUserId(), jwtToken);
            if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
                String message = String.format("Heavy Rain Alert: %.1fmm predicted for your farm '%s'. Avoid irrigation today. - AgriSmart",
                        response.getRainfall(), farm.getFarmName());
                sendSmsAlert(user.getPhone(), message);
            }
        }

        return response;
    }

    public ForecastResponse forecastWeather(Long farmId, String jwtToken) {
        FarmResponse farm = fetchFarmDetails(farmId, jwtToken);
        Double lat = farm.getLatitude();
        Double lon = farm.getLongitude();

        if (lat == null || lon == null) {
            throw new BadRequestException("Latitude and Longitude coordinates are not configured for this farm plot. Please edit the farm and set them.");
        }

        List<ForecastResponse.ForecastItem> items = new ArrayList<>();

        // 1. Primary Source: OpenWeatherMap 5-Day Forecast
        if (openWeatherApiKey != null && !openWeatherApiKey.isBlank() && !"dummy_api_key".equals(openWeatherApiKey)) {
            try {
                RestClient openWeatherClient = restClientBuilder.baseUrl("https://api.openweathermap.org").build();
                String uri = String.format("/data/2.5/forecast?lat=%.4f&lon=%.4f&appid=%s&units=metric", lat, lon, openWeatherApiKey);

                Map<String, Object> forecastData = openWeatherClient.get()
                        .uri(uri)
                        .retrieve()
                        .body(new ParameterizedTypeReference<Map<String, Object>>() {});

                if (forecastData != null && forecastData.containsKey("list")) {
                    List<Map<String, Object>> list = (List<Map<String, Object>>) forecastData.get("list");
                    Map<String, List<Map<String, Object>>> groupedByDay = new LinkedHashMap<>();

                    for (Map<String, Object> entry : list) {
                        String dtTxt = (String) entry.get("dt_txt");
                        if (dtTxt != null && dtTxt.length() >= 10) {
                            String dateKey = dtTxt.substring(0, 10);
                            groupedByDay.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(entry);
                        }
                    }

                    int count = 0;
                    for (Map.Entry<String, List<Map<String, Object>>> dayEntry : groupedByDay.entrySet()) {
                        if (count >= 5) break;
                        String date = dayEntry.getKey();
                        List<Map<String, Object>> dayReadings = dayEntry.getValue();

                        double maxTemp = Double.MIN_VALUE;
                        double minTemp = Double.MAX_VALUE;
                        double totalRain = 0.0;
                        double sumHumidity = 0.0;
                        String description = "Clear";

                        for (Map<String, Object> reading : dayReadings) {
                            Map<String, Object> main = (Map<String, Object>) reading.get("main");
                            double tMax = ((Number) main.get("temp_max")).doubleValue();
                            double tMin = ((Number) main.get("temp_min")).doubleValue();
                            double hum = ((Number) main.get("humidity")).doubleValue();

                            if (tMax > maxTemp) maxTemp = tMax;
                            if (tMin < minTemp) minTemp = tMin;
                            sumHumidity += hum;

                            if (reading.containsKey("rain")) {
                                Map<String, Object> rainMap = (Map<String, Object>) reading.get("rain");
                                if (rainMap.containsKey("3h")) {
                                    totalRain += ((Number) rainMap.get("3h")).doubleValue();
                                }
                            }

                            if (reading.containsKey("weather")) {
                                List<Map<String, Object>> wList = (List<Map<String, Object>>) reading.get("weather");
                                if (!wList.isEmpty()) {
                                    description = (String) wList.get(0).get("main");
                                }
                            }
                        }

                        double avgHumidity = dayReadings.isEmpty() ? 70.0 : sumHumidity / dayReadings.size();

                        items.add(ForecastResponse.ForecastItem.builder()
                                .date(date)
                                .tempMax(maxTemp)
                                .tempMin(minTemp)
                                .humidity(avgHumidity)
                                .rainfall(totalRain)
                                .description(description)
                                .build());
                        count++;
                    }
                }
            } catch (Exception e) {
                System.err.println("OpenWeatherMap Forecast call failed, falling back: " + e.getMessage());
            }
        }

        // 2. Secondary Fallback Source: Open-Meteo Forecast
        if (items.isEmpty()) {
            try {
                RestClient openMeteoClient = restClientBuilder.baseUrl("https://api.open-meteo.com").build();
                String uri = String.format("/v1/forecast?latitude=%.4f&longitude=%.4f&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,rain_sum,weather_code&timezone=auto", lat, lon);

                Map<String, Object> openMeteoData = openMeteoClient.get()
                        .uri(uri)
                        .retrieve()
                        .body(new ParameterizedTypeReference<Map<String, Object>>() {});

                if (openMeteoData != null && openMeteoData.containsKey("daily")) {
                    Map<String, Object> daily = (Map<String, Object>) openMeteoData.get("daily");
                    List<String> times = (List<String>) daily.get("time");
                    List<Number> maxTemps = (List<Number>) daily.get("temperature_2m_max");
                    List<Number> minTemps = (List<Number>) daily.get("temperature_2m_min");
                    List<Number> humidities = (List<Number>) daily.get("relative_humidity_2m_max");
                    List<Number> rainSums = (List<Number>) daily.get("rain_sum");
                    List<Number> weatherCodes = (List<Number>) daily.get("weather_code");

                    for (int i = 0; i < Math.min(5, times.size()); i++) {
                        int code = weatherCodes.get(i).intValue();
                        items.add(ForecastResponse.ForecastItem.builder()
                                .date(times.get(i))
                                .tempMax(maxTemps.get(i).doubleValue())
                                .tempMin(minTemps.get(i).doubleValue())
                                .humidity(humidities.get(i).doubleValue())
                                .rainfall(rainSums.get(i).doubleValue())
                                .description(mapWmoCodeToDescription(code))
                                .build());
                    }
                }
            } catch (Exception e) {
                System.err.println("Open-Meteo Forecast failed, using offline fallback: " + e.getMessage());
            }
        }

        // 3. Tertiary Offline Fallback
        if (items.isEmpty()) {
            for (int i = 1; i <= 5; i++) {
                LocalDate date = LocalDate.now().plusDays(i);
                items.add(ForecastResponse.ForecastItem.builder()
                        .date(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .tempMax(31.0)
                        .tempMin(24.0)
                        .humidity(70.0)
                        .rainfall(0.0)
                        .description("Partly Cloudy")
                        .build());
            }
        }

        return ForecastResponse.builder()
                .forecast(items)
                .build();
    }

    public List<WeatherHistory> getWeatherHistory(Long farmId, String jwtToken) {
        fetchFarmDetails(farmId, jwtToken);
        return weatherHistoryRepository.findTop10ByFarmIdOrderByRecordedAtDesc(farmId);
    }

    private void sendSmsAlert(String phoneNumber, String message) {
        if (twilioAccountSid == null || twilioAccountSid.isBlank() ||
            twilioAuthToken == null || twilioAuthToken.isBlank() ||
            twilioPhoneNumber == null || twilioPhoneNumber.isBlank()) {
            System.out.println("Twilio SMS Dispatch Simulation (Credentials Unset) TO " + phoneNumber + ": " + message);
            return;
        }

        try {
            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber(phoneNumber),
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    message
            ).create();
            System.out.println("SMS SENT successfully via Twilio to " + phoneNumber);
        } catch (Exception e) {
            System.err.println("Failed to execute real Twilio SMS API call: " + e.getMessage());
        }
    }

    private String mapWmoCodeToDescription(int code) {
        switch (code) {
            case 0: return "Sunny";
            case 1: case 2: case 3: return "Partly Cloudy";
            case 45: case 48: return "Foggy";
            case 51: case 53: case 55: return "Drizzle";
            case 61: case 63: case 65: return "Rainy";
            case 71: case 73: case 75: return "Snowy";
            case 80: case 81: case 82: return "Rain Showers";
            case 95: case 96: case 99: return "Thunderstorm";
            default: return "Cloudy";
        }
    }
}
