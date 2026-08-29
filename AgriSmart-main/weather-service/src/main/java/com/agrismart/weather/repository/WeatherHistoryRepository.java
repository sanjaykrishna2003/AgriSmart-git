package com.agrismart.weather.repository;

import com.agrismart.weather.entity.WeatherHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherHistoryRepository extends JpaRepository<WeatherHistory, Long> {
    List<WeatherHistory> findByFarmIdOrderByRecordedAtDesc(Long farmId);
    List<WeatherHistory> findTop10ByFarmIdOrderByRecordedAtDesc(Long farmId);
}
