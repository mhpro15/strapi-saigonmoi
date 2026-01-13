'use strict';

/**
 * Generate preview pathname based on content type and document
 * Customize this function based on your content types and URL structure
 */
const getPreviewPathname = (uid, { locale, document }) => {
  const { slug } = document || {};

  // Handle different content types with their specific URL patterns
  switch (uid) {
    case "api::page.page":
      if (!slug) return "/";
      switch (slug) {
        case "homepage":
          return locale ? `/${locale}` : "/";
        case "about":
          return "/about";
        case "contact":
          return "/contact";
        default:
          return `/${slug}`;
      }

    case "api::article.article":
      if (!slug) return "/blog";
      return `/blog/${slug}`;

    case "api::thoi-su.thoi-su":
      if (!slug) return "/thoi-su";
      return `/thoi-su/${slug}`;

    case "api::the-gioi.the-gioi":
      if (!slug) return "/the-gioi";
      return `/the-gioi/${slug}`;

    case "api::kinh-te.kinh-te":
      if (!slug) return "/kinh-te";
      return `/kinh-te/${slug}`;

    case "api::doi-song.doi-song":
      if (!slug) return "/doi-song";
      return `/doi-song/${slug}`;

    case "api::khai-quang.khai-quang":
      if (!slug) return "/khai-quang";
      return `/khai-quang/${slug}`;

    case "api::giao-duc.giao-duc":
      if (!slug) return "/giao-duc";
      return `/giao-duc/${slug}`;

    case "api::van-hoa-the-thao.van-hoa-the-thao":
      if (!slug) return "/van-hoa-the-thao";
      return `/van-hoa-the-thao/${slug}`;

    default:
      return null;
  }
};

module.exports = ({ env }) => {
  const clientUrl = env("CLIENT_URL", "http://localhost:3000");
  const previewSecret = env("PREVIEW_SECRET", "");

  return {
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
    apiToken: {
      salt: env("API_TOKEN_SALT"),
    },
    transfer: {
      token: {
        salt: env("TRANSFER_TOKEN_SALT"),
      },
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },

    // Preview configuration
    preview: {
      enabled: true,
      config: {
        allowedOrigins: clientUrl,
        async handler(uid, { documentId, locale, status }) {
          const document = await strapi.documents(uid).findOne({ documentId });
          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) {
            return null;
          }

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status: status || "draft",
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
