C4Context
title Cross-Device Fullstack Payment System - Context

Person(vendor, "Vendor", "Merchant initiating and managing payments")
Person(analyst, "Analyst", "Monitors and reviews transactions")
System_Ext(pg, "External Payment Gateway", "Third-party payment processor (sandbox/production)")
System_Ext(idp, "Bank Identity Provider", "SSO / IAM provider")

System_Boundary(system, "Payment Platform") {
System(web, "Web Application", "React + MFEs")
System(mobile, "Mobile App", "React Native")
System(bff, "API Gateway / BFF", "Node.js + Express + GraphQL")
System(payments, "Payments Service", "Payment orchestration")
System(reporting, "Reporting Service", "Transaction reporting")
System(risk, "Risk Service", "Fraud & risk scoring (future)")
System(ledger, "Ledger Service", "Accounting ledger (future)")
}

Rel(vendor, web, "Uses via browser", "HTTPS")
Rel(vendor, mobile, "Uses via app", "HTTPS")
Rel(analyst, web, "Uses via browser", "HTTPS")

Rel(web, bff, "GraphQL queries/mutations", "HTTPS")
Rel(mobile, bff, "GraphQL queries/mutations", "HTTPS")

Rel(bff, payments, "REST APIs")
Rel(bff, reporting, "REST APIs")

Rel(payments, pg, "Authorize/Capture payments", "HTTPS")
Rel(payments, ledger, "Emit payment events (future)", "Events/REST")
Rel(payments, risk, "Request risk score (future)", "REST")

Rel(reporting, ledger, "Consume ledger events (future)", "Events/Streams")

Rel(vendor, idp, "Authenticates (SSO)", "OIDC/SAML")
Rel(analyst, idp, "Authenticates (SSO)", "OIDC/SAML")
Rel(idp, bff, "Issues JWT / tokens", "OIDC")
