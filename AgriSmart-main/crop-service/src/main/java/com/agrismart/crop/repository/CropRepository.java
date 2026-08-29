package com.agrismart.crop.repository;

import com.agrismart.crop.entity.Crop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    Page<Crop> findByFarmIdIn(List<Long> farmIds, Pageable pageable);
    List<Crop> findByFarmId(Long farmId);
    Page<Crop> findByFarmId(Long farmId, Pageable pageable);
    long countByFarmIdIn(List<Long> farmIds);

    @Query(value = "SELECT district FROM users WHERE user_id = :officerId AND role = 'OFFICER'", nativeQuery = true)
    List<String> findOfficerDistrict(@Param("officerId") Long officerId);

    @Query(value = "SELECT f.farm_id FROM farms f JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(:dist) OR LOWER(u.state) = LOWER(:dist))", nativeQuery = true)
    List<Long> findFarmIdsByRegion(@Param("dist") String dist);
}
