package com.agrismart.farm.repository;

import com.agrismart.farm.entity.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    Page<Farm> findByUserId(Long userId, Pageable pageable);
    Page<Farm> findByUserIdIn(List<Long> userIds, Pageable pageable);
    List<Farm> findByUserId(Long userId);
    long countByUserId(Long userId);

    @Query(value = "SELECT district FROM users WHERE user_id = :officerId AND role = 'OFFICER'", nativeQuery = true)
    List<String> findOfficerDistrict(@Param("officerId") Long officerId);

    @Query(value = "SELECT user_id FROM users WHERE role = 'FARMER' AND (LOWER(district) = LOWER(:dist) OR LOWER(state) = LOWER(:dist))", nativeQuery = true)
    List<Long> findFarmerIdsByRegion(@Param("dist") String dist);
}
