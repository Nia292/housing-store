package eu.moon.housingdb;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class HousingSecurityConfig {

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth, HousesConfig housesConfig, PasswordEncoder encoder) throws Exception {
        var builder = auth.inMemoryAuthentication();
        for (String allowedPassword : housesConfig.allowedPasswords()) {
            var split = allowedPassword.split(":");
            builder.withUser(split[0]).password(encoder.encode(split[1])).authorities("ROLE_USER");
        }
    }
}
