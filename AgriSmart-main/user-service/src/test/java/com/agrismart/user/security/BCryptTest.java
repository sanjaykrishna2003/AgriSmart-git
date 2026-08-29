package com.agrismart.user.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class BCryptTest {

    @Test
    public void testPasswordMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "password";
        String seededHash = "$2a$10$e0MYzAdyPDkJJJGD3YnUGOJjY051Kk385Jk1h5eE7uC08H6X7i992";
        
        System.out.println("Generated Hash for 'password': " + encoder.encode(rawPassword));
        assertTrue(encoder.matches(rawPassword, seededHash), "Seeded hash should match 'password'");
    }
}
