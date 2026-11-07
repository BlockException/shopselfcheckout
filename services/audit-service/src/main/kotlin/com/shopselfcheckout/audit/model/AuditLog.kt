package com.shopselfcheckout.audit.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "audit_logs")
data class AuditLog(
    @Id
    val id: String? = null,
    val eventId: String,
    val aggregateType: String,
    val aggregateId: String,
    val eventType: String,
    val timestamp: Instant,
    val sourceService: String,
    val userAgent: String?,
    val ipAddress: String?,
    val metadata: Map<String, Any>,
    val payload: String
)
