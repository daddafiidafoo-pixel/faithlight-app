{
  "modals": [
    {
      "name": "InviteRoomModal",
      "title": "room.invite",
      "components": [
        {
          "type": "infoCard",
          "props": {
            "items": [
              {
                "label": "createRoom.name",
                "value": "{{room.name}}"
              },
              {
                "label": "createRoom.privacy",
                "value": "{{room.privacy}}"
              },
              {
                "label": "room.privateJoinCode",
                "value": "{{room.inviteCode}}"
              }
            ]
          }
        },
        {
          "type": "textInput",
          "name": "shareLink",
          "label": "room.roomLink",
          "defaultValue": "https://faithlight.app/study-rooms/{{room.id}}",
          "readOnly": true
        },
        {
          "type": "button",
          "props": {
            "label": "room.copyInviteCode",
            "variant": "outline",
            "action": {
              "type": "copyToClipboard",
              "value": "{{room.inviteCode}}"
            }
          }
        },
        {
          "type": "button",
          "props": {
            "label": "room.copyRoomLink",
            "variant": "outline",
            "action": {
              "type": "copyToClipboard",
              "value": "https://faithlight.app/study-rooms/{{room.id}}"
            }
          }
        },
        {
          "type": "button",
          "props": {
            "label": "room.share",
            "variant": "default",
            "action": {
              "type": "share",
              "payload": {
                "title": "{{room.name}}",
                "text": "Join my FaithLight study room: {{room.name}}",
                "url": "https://faithlight.app/study-rooms/{{room.id}}"
              }
            }
          }
        }
      ]
    },
    {
      "name": "EditRoomModal",
      "title": "room.editRoom",
      "components": [
        {
          "type": "textInput",
          "name": "name",
          "label": "createRoom.name",
          "defaultValue": "{{room.name}}",
          "required": true
        },
        {
          "type": "textarea",
          "name": "description",
          "label": "createRoom.description",
          "defaultValue": "{{room.description}}"
        },
        {
          "type": "select",
          "name": "language",
          "label": "createRoom.language",
          "defaultValue": "{{room.language}}",
          "options": [
            {
              "label": "English",
              "value": "en"
            },
            {
              "label": "Afaan Oromoo",
              "value": "om"
            },
            {
              "label": "Amharic",
              "value": "am"
            },
            {
              "label": "Arabic",
              "value": "ar"
            },
            {
              "label": "French",
              "value": "fr"
            },
            {
              "label": "Swahili",
              "value": "sw"
            }
          ]
        },
        {
          "type": "select",
          "name": "category",
          "label": "createRoom.category",
          "defaultValue": "{{room.category}}",
          "options": [
            {
              "label": "Bible Study",
              "value": "bible-study"
            },
            {
              "label": "Prayer",
              "value": "prayer"
            },
            {
              "label": "Youth",
              "value": "youth"
            },
            {
              "label": "Sermon Discussion",
              "value": "sermon-discussion"
            },
            {
              "label": "Theology",
              "value": "theology"
            },
            {
              "label": "Church Group",
              "value": "church-group"
            },
            {
              "label": "Other",
              "value": "other"
            }
          ]
        },
        {
          "type": "radioGroup",
          "name": "privacy",
          "label": "createRoom.privacy",
          "defaultValue": "{{room.privacy}}",
          "options": [
            {
              "label": "createRoom.public",
              "value": "public"
            },
            {
              "label": "createRoom.private",
              "value": "private"
            }
          ]
        },
        {
          "type": "textInput",
          "name": "inviteCode",
          "label": "createRoom.inviteCode",
          "defaultValue": "{{room.inviteCode}}",
          "visibleWhen": {
            "field": "privacy",
            "equals": "private"
          }
        },
        {
          "type": "numberInput",
          "name": "maxMembers",
          "label": "createRoom.maxMembers",
          "defaultValue": "{{room.maxMembers}}"
        },
        {
          "type": "switch",
          "name": "allowPrayerRequests",
          "label": "createRoom.allowPrayerRequests",
          "defaultValue": "{{room.allowPrayerRequests}}"
        },
        {
          "type": "switch",
          "name": "allowVerseSharing",
          "label": "createRoom.allowVerseSharing",
          "defaultValue": "{{room.allowVerseSharing}}"
        },
        {
          "type": "switch",
          "name": "allowAISummaries",
          "label": "createRoom.allowAISummaries",
          "defaultValue": "{{room.allowAISummaries}}"
        },
        {
          "type": "textarea",
          "name": "rules",
          "label": "room.rulesLabel",
          "defaultValue": "{{room.rules}}"
        },
        {
          "type": "formActions",
          "props": {
            "cancelLabel": "createRoom.cancel",
            "submitLabel": "room.saveChanges"
          },
          "actions": {
            "submit": [
              {
                "type": "updateRecord",
                "entity": "StudyRoom",
                "recordId": "{{room.id}}",
                "payload": {
                  "name": "{{form.name}}",
                  "description": "{{form.description}}",
                  "language_code": "{{form.language}}",
                  "category": "{{form.category}}",
                  "visibility": "{{form.privacy}}",
                  "invite_code": "{{form.inviteCode}}",
                  "max_members": "{{form.maxMembers}}",
                  "allow_prayer_requests": "{{form.allowPrayerRequests}}",
                  "allow_verse_sharing": "{{form.allowVerseSharing}}",
                  "allow_ai_summaries": "{{form.allowAISummaries}}",
                  "room_rules": "{{form.rules}}"
                }
              },
              {
                "type": "closeModal"
              }
            ]
          }
        }
      ]
    }
  ]
}