package eu.moon.housingdb.security;

import eu.moon.housingdb.HousesConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

@Slf4j
@Service
public class FileUserDetailService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final HousesConfig housesConfig;

    private final Map<String, String> users = new ConcurrentHashMap<>();

    public FileUserDetailService(PasswordEncoder passwordEncoder, HousesConfig housesConfig) {
        this.passwordEncoder = passwordEncoder;
        this.housesConfig = housesConfig;
        updateUserList();

    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return Optional.ofNullable(users.get(username))
                .map(password -> User.builder().username(username).password(password).roles("USER").build())
                .orElseThrow(() -> new UsernameNotFoundException(username + " not found"));
    }


    @Scheduled(fixedDelay = 5 * 60 * 1000, initialDelay = 5 * 60 * 1000)
    public void updateUserList() {
       try {
           log.info("Updating user list...");
           users.clear();
           Stream.concat(getUserDetailsFromFile(), getUserDetailsFromConfig())
                   .forEach(userDetails -> {
                       users.put(userDetails.getUsername(), userDetails.getPassword());
                   });
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
    }


    private Stream<UserDetails> getUserDetailsFromConfig() {
        return housesConfig.allowedPasswords()
                .stream()
                .map(s -> {
                    String[] split = s.split(":");
                    return User.builder()
                            .username(split[0])
                            .password(split[1])
                            .passwordEncoder(passwordEncoder::encode)
                            .roles("USER")
                            .build();
                });
    }

    private Stream<UserDetails> getUserDetailsFromFile() throws IOException {
        var path = housesConfig.getUserFile();
        if (!StringUtils.hasText(path)) {
            return Stream.empty();
        }
        if (!Files.exists(Paths.get(housesConfig.getUserFile()))) {
            return Stream.empty();
        }
        String data = Files.readString(Paths.get(housesConfig.getUserFile()));
        return Stream.of(data.split("\n"))
                .filter(StringUtils::hasText)
                .map(s -> {
                    String[] split = s.split(":");
                    return User.builder()
                            .username(split[0])
                            .password(split[1])
                            .roles("USER")
                            .passwordEncoder(passwordEncoder::encode)
                            .build();
                });
    }
}
