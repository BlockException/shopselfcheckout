use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Transaction {
    checkout_id: String,
    amount: f64,
    terminal_id: String,
    customer_id: Option<String>,
    timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FraudCheckResult {
    is_fraudulent: bool,
    risk_score: f64,
    reasons: Vec<String>,
}

struct FraudRulesEngine;

impl FraudRulesEngine {
    fn check(&self, tx: &Transaction) -> FraudCheckResult {
        let mut score = 0.0;
        let mut reasons = Vec::new();

        if tx.amount > 500.0 {
            score += 50.0;
            reasons.push("High value transaction".to_string());
        }

        if tx.amount > 1000.0 {
            score += 30.0;
            reasons.push("Very high value transaction".to_string());
        }

        if tx.customer_id.is_none() && tx.amount > 100.0 {
            score += 20.0;
            reasons.push("Guest checkout with high amount".to_string());
        }

        FraudCheckResult {
            is_fraudulent: score >= 70.0,
            risk_score: score,
            reasons,
        }
    }
}

struct UnitOfWork {
    pending_checks: Mutex<Vec<(Transaction, FraudCheckResult)>>,
}

impl UnitOfWork {
    fn new() -> Self {
        UnitOfWork {
            pending_checks: Mutex::new(Vec::new()),
        }
    }

    fn register_check(&self, tx: Transaction, result: FraudCheckResult) {
        self.pending_checks.lock().unwrap().push((tx, result));
    }

    fn commit(&self) {
        let mut pending = self.pending_checks.lock().unwrap();
        println!("Committing {} fraud checks", pending.len());
        pending.clear();
    }

    fn rollback(&self) {
        let mut pending = self.pending_checks.lock().unwrap();
        println!("Rolling back {} fraud checks", pending.len());
        pending.clear();
    }
}

async fn check_fraud(
    tx: web::Json<Transaction>,
    engine: web::Data<FraudRulesEngine>,
    uow: web::Data<UnitOfWork>,
) -> impl Responder {
    let result = engine.check(&tx);
    uow.register_check(tx.into_inner(), result.clone());
    uow.commit();
    HttpResponse::Ok().json(result)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let engine = web::Data::new(FraudRulesEngine);
    let uow = web::Data::new(UnitOfWork::new());

    HttpServer::new(move || {
        App::new()
            .app_data(engine.clone())
            .app_data(uow.clone())
            .route("/api/v1/fraud/check", web::post().to(check_fraud))
    })
    .bind(("0.0.0.0", 8083))?
    .run()
    .await
}
