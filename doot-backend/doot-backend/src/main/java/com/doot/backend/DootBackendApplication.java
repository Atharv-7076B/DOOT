package com.doot.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DootBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DootBackendApplication.class, args);
	}

}
