package com.agrismart.user.repository;

import com.agrismart.user.entity.User;
import com.agrismart.user.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrPhone(String email, String phone);
    boolean existsByEmail(String email);
    
    Page<User> findByRole(Role role, Pageable pageable);
    long countByRole(Role role);
    List<User> findByRole(Role role);
}

