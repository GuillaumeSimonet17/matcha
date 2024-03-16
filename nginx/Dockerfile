FROM nginx:1.24

RUN apt-get update -y && apt-get install -y git

RUN apt-get install -y openssl nginx

# _____ Autosigned cert option _____:
RUN openssl req -x509 -newkey rsa:2048 -nodes \
    -subj "/C=FR" \
    -keyout /etc/nginx/matcha.key \
    -out /etc/nginx/matcha.cer \
    && chmod 644 /etc/nginx/matcha.cer

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
