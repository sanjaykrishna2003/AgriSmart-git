package com.agrismart.weather.dto;

import java.util.List;

public class ForecastResponse {
    private List<ForecastItem> forecast;

    public ForecastResponse() {
    }

    public ForecastResponse(List<ForecastItem> forecast) {
        this.forecast = forecast;
    }

    public List<ForecastItem> getForecast() {
        return forecast;
    }

    public void setForecast(List<ForecastItem> forecast) {
        this.forecast = forecast;
    }

    public static ForecastResponseBuilder builder() {
        return new ForecastResponseBuilder();
    }

    public static class ForecastResponseBuilder {
        private List<ForecastItem> forecast;

        public ForecastResponseBuilder forecast(List<ForecastItem> forecast) {
            this.forecast = forecast;
            return this;
        }

        public ForecastResponse build() {
            return new ForecastResponse(forecast);
        }
    }

    public static class ForecastItem {
        private String date; // e.g. "2026-06-20"
        private Double tempMin;
        private Double tempMax;
        private Double humidity;
        private Double rainfall;
        private String description;

        public ForecastItem() {
        }

        public ForecastItem(String date, Double tempMin, Double tempMax, Double humidity, Double rainfall, String description) {
            this.date = date;
            this.tempMin = tempMin;
            this.tempMax = tempMax;
            this.humidity = humidity;
            this.rainfall = rainfall;
            this.description = description;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Double getTempMin() {
            return tempMin;
        }

        public void setTempMin(Double tempMin) {
            this.tempMin = tempMin;
        }

        public Double getTempMax() {
            return tempMax;
        }

        public void setTempMax(Double tempMax) {
            this.tempMax = tempMax;
        }

        public Double getHumidity() {
            return humidity;
        }

        public void setHumidity(Double humidity) {
            this.humidity = humidity;
        }

        public Double getRainfall() {
            return rainfall;
        }

        public void setRainfall(Double rainfall) {
            this.rainfall = rainfall;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public static ForecastItemBuilder builder() {
            return new ForecastItemBuilder();
        }

        public static class ForecastItemBuilder {
            private String date;
            private Double tempMin;
            private Double tempMax;
            private Double humidity;
            private Double rainfall;
            private String description;

            public ForecastItemBuilder date(String date) {
                this.date = date;
                return this;
            }

            public ForecastItemBuilder tempMin(Double tempMin) {
                this.tempMin = tempMin;
                return this;
            }

            public ForecastItemBuilder tempMax(Double tempMax) {
                this.tempMax = tempMax;
                return this;
            }

            public ForecastItemBuilder humidity(Double humidity) {
                this.humidity = humidity;
                return this;
            }

            public ForecastItemBuilder rainfall(Double rainfall) {
                this.rainfall = rainfall;
                return this;
            }

            public ForecastItemBuilder description(String description) {
                this.description = description;
                return this;
            }

            public ForecastItem build() {
                return new ForecastItem(date, tempMin, tempMax, humidity, rainfall, description);
            }
        }
    }
}

