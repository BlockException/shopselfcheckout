package com.shopselfcheckout.audit

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class AuditLogServiceApplication

fun main(args: Array<String>) {
    runApplication<AuditLogServiceApplication>(*args)
}
