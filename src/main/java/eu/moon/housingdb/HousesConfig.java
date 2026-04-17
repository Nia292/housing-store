package eu.moon.housingdb;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "houses")
public class HousesConfig {
    private String passwords;
    private String userFile;

    public List<String> allowedPasswords() {
        return List.of(passwords.split(","));
    }
}
