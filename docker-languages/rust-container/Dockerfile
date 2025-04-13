FROM rust:1.67

WORKDIR /usr/src/myapp
COPY . .

RUN cargo build --release

CMD ["./target/release/rust-container"]

