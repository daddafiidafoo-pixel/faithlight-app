{
  "workflows": [
    {
      "name": "leaveRoom",
      "description": "User leaves a study room",
      "steps": [
        {
          "type": "query",
          "entity": "StudyRoomMember",
          "filter": {
            "room_id": "{{room.id}}",
            "user_id": "{{currentUser.id}}",
            "status": "active"
          },
          "storeAs": "currentMembership"
        },
        {
          "type": "conditional",
          "conditions": [
            {
              "if": "{{currentMembership.role !== 'owner'}}",
              "then": [
                {
                  "type": "updateRecord",
                  "entity": "StudyRoomMember",
                  "recordId": "{{currentMembership.id}}",
                  "payload": {
                    "status": "left"
                  }
                },
                {
                  "type": "updateRecord",
                  "entity": "StudyRoom",
                  "recordId": "{{room.id}}",
                  "payload": {
                    "member_count": "{{Math.max(0, room.member_count - 1)}}",
                    "last_activity_at": "{{now}}"
                  }
                },
                {
                  "type": "navigate",
                  "to": "/StudyRooms"
                }
              ]
            },
            {
              "if": "{{currentMembership.role === 'owner'}}",
              "then": [
                {
                  "type": "showAlert",
                  "alertType": "error",
                  "title": "room.ownerCannotLeaveTitle",
                  "message": "room.ownerCannotLeaveMessage"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "summarizeDiscussion",
      "description": "Generate AI summary of recent room messages",
      "steps": [
        {
          "type": "query",
          "entity": "StudyRoomMessage",
          "filter": {
            "room_id": "{{room.id}}"
          },
          "sort": [
            {
              "field": "created_date",
              "direction": "desc"
            }
          ],
          "limit": 20,
          "storeAs": "recentMessages"
        },
        {
          "type": "aiGenerate",
          "storeAs": "summaryResult",
          "model": "gemini_3_flash",
          "prompt": "Summarize the recent discussion in this FaithLight study room.\nRules:\n- Use the room language: {{room.language_code}}\n- Keep it under 120 words\n- Mention main Bible topic\n- Mention key verse references\n- Mention prayer requests only if clearly present\n- Keep tone encouraging, respectful, and spiritually helpful\n\nDiscussion:\n{{recentMessages.map(m => m.user_id + ': ' + m.content).join('\\n')}}"
        },
        {
          "type": "createRecord",
          "entity": "StudyRoomMessage",
          "payload": {
            "room_id": "{{room.id}}",
            "user_id": "{{currentUser.id}}",
            "message_type": "system",
            "content": "📝 AI Summary:\n\n{{summaryResult}}",
            "language_code": "{{room.language_code}}"
          }
        },
        {
          "type": "updateRecord",
          "entity": "StudyRoom",
          "recordId": "{{room.id}}",
          "payload": {
            "last_activity_at": "{{now}}"
          }
        }
      ]
    }
  ]
}