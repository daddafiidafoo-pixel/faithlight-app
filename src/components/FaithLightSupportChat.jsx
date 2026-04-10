import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguageSettings } from "./context/LanguageSettingsContext";
import { useI18n } from "./I18nProvider";

export default function FaithLightSupportChat() {
  const { uiLanguage } = useLanguageSettings();
  const { t } = useI18n();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const issueOptions = useMemo(
    () => [
      t("supportChat.issue.page", "Page not loading"),
      t("supportChat.issue.language", "Language not changing"),
      t("supportChat.issue.ai", "AI response failed"),
      t("supportChat.issue.quiz", "Quiz not working"),
      t("supportChat.issue.audio", "Audio Bible problem"),
      t("supportChat.issue.share", "Verse sharing problem"),
      t("supportChat.issue.other", "Something else"),
    ],
    [t]
  );

  const introMessage = useMemo(
    () => ({
      id: "intro",
      role: "assistant",
      text:
        `${t("supportChat.greeting", "Hi! 👋 I'm the FaithLight Support Assistant.")}\n\n` +
        t(
          "supportChat.intro",
          "How can I help you today? You can pick a common issue below or type your own question."
        ),
    }),
    [t]
  );

  async function sendSupportMessage(textToSend) {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setErrorText("");
    setLoading(true);

    try {
      const response = await base44.functions.invoke("supportChat", {
        message: textToSend,
        language: uiLanguage,
      });

      const aiMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.data?.answer || response.data,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Support chat failed:", error);
      setErrorText(
        t(
          "errors.supportUnavailable",
          "We could not get a support response right now."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleIssueClick(issueText) {
    sendSupportMessage(issueText);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendSupportMessage(message);
  }

  function handleRefresh() {
    setMessages([]);
    setMessage("");
    setErrorText("");
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        borderRadius: 24,
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid #e6e6e6",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        margin: "0 auto",
      }}
      className="w-full sm:max-w-md md:max-w-lg px-4 sm:px-0"
    >
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5, #6d28d9)",
          color: "#fff",
          padding: "18px 18px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>◔</div>
          <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1.2 }}>
            {t("supportChat.title", "FaithLight Support")}
          </div>
          <div style={{ opacity: 0.9, marginTop: 4, fontSize: 14 }}>
            {t("supportChat.subtitle", "AI Help Assistant")}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
          }}
          aria-label={t("supportChat.refresh", "Refresh")}
          title={t("supportChat.refresh", "Refresh")}
        >
          ↻
        </button>
      </div>

      <div style={{ padding: 16, background: "#fafafa" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #ececec",
            borderRadius: 20,
            padding: 18,
            marginBottom: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {introMessage.text}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {issueOptions.map((issue) => (
            <button
              key={issue}
              type="button"
              onClick={() => handleIssueClick(issue)}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #cfd4ff",
                background: "#fff",
                color: "#4f46e5",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              {issue}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            maxHeight: 320,
            overflowY: "auto",
            paddingRight: 4,
            marginBottom: 14,
          }}
        >
          {messages.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent:
                  item.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "82%",
                  padding: "12px 14px",
                  borderRadius: 18,
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  background:
                    item.role === "user" ? "#5b4ff7" : "#ffffff",
                  color: item.role === "user" ? "#fff" : "#222",
                  border:
                    item.role === "user"
                      ? "none"
                      : "1px solid #ececec",
                }}
              >
                {item.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  maxWidth: "82%",
                  padding: "12px 14px",
                  borderRadius: 18,
                  lineHeight: 1.6,
                  background: "#ffffff",
                  color: "#444",
                  border: "1px solid #ececec",
                }}
              >
                {t("common.loading", "Loading...")}
              </div>
            </div>
          )}
        </div>

        {errorText && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#fff3f3",
              border: "1px solid #f0caca",
              color: "#c62828",
              lineHeight: 1.5,
            }}
          >
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(
              "supportChat.placeholder",
              "Describe your issue..."
            )}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #ddd",
              outline: "none",
              fontSize: 15,
            }}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            style={{
              minWidth: 56,
              borderRadius: 16,
              border: "none",
              background: "#8b5cf6",
              color: "#fff",
              fontSize: 20,
              cursor: loading || !message.trim() ? "not-allowed" : "pointer",
            }}
            aria-label={t("supportChat.send", "Send")}
            title={t("supportChat.send", "Send")}
          >
            ➤
          </button>
        </form>

        <div
          style={{
            marginTop: 14,
            fontSize: 14,
            color: "#666",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {t("supportChat.emailHelp", "Can't resolve it? Email")}{" "}
          <a href="mailto:support@faithlight.app">support@faithlight.app</a>
        </div>
      </div>
    </div>
  );
}