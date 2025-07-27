import json
from http.server import BaseHTTPRequestHandler
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography import x509


class Handler(BaseHTTPRequestHandler):

    def do_post(self):
        try:
            content_lenght = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_lenght)
            data = json.loads(post_data)

            # * CSR Generation logic
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=int(data.get("keySize", 2048),)
            )

            # * Fields to ask for

            subject = x509.Name([
                x509.NameAttribute(x509.oid.NameOID.COUNTRY_NAME, data.get("country", u"IE")),
                x509.NameAttribute(x509.oid.NameOID.STATE_OR_PROVINCE_NAME, data.get("state", u"Dublin")),
                x509.NameAttribute(x509.oid.NameOID.LOCALITY_NAME, data.get("locality", u"Dublin")),
                x509.NameAttribute(x509.oid.NameOID.ORGANIZATION_NAME, data.get("organization", u"My Company")),
                x509.NameAttribute(x509.oid.NameOID.ORGANIZATIONAL_UNIT_NAME, data.get("organizationalUnit", u"IT")),
                x509.NameAttribute(x509.oid.NameOID.COMMON_NAME, data.get("commonName", u"example.com")),
            ])

            builder = x509.CertificateSigningRequestBuilder().subject_name(subject)
            csr = builder.sign(private_key, hashes.SHA256())

            # ? Serializing the key and CSR to PEM Format
            private_key_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            ).decode('utf-8')

            csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode('utf-8')

            # * Send successful response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "privateKey": private_key_pem,
                "csr": csr_pem,
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    
