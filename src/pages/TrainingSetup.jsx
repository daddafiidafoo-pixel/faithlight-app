import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingSetup() {
  const [loading, setLoading] = useState(false);

  const setupTraining = async () => {
    setLoading(true);
    try {
      // ========== BIBLICAL TRAINING TRACKS ==========
      
      // Biblical Level 1
      const biblicalTrack1 = await base44.entities.TrainingTrack.create({
        name: 'Biblical Training - Level 1 (Foundations)',
        description: 'Build a strong foundation in God\'s Word and Christian faith',
        icon: '📖',
        level: 1,
        track_type: 'biblical',
        order: 1,
      });

      // Biblical Level 2
      const biblicalTrack2 = await base44.entities.TrainingTrack.create({
        name: 'Biblical Training - Level 2 (Doctrine)',
        description: 'Deep dive into core Christian doctrines and theology',
        icon: '📘',
        level: 2,
        track_type: 'biblical',
        order: 2,
      });

      // Biblical Level 3
      const biblicalTrack3 = await base44.entities.TrainingTrack.create({
        name: 'Biblical Training - Level 3 (Discipleship)',
        description: 'Advanced discipleship, evangelism, and Christian ethics',
        icon: '📕',
        level: 3,
        track_type: 'biblical',
        order: 3,
      });

      // ========== LEADERSHIP TRAINING TRACKS ==========
      
      // Leadership Level 1
      const leadershipTrack1 = await base44.entities.TrainingTrack.create({
        name: 'Leadership Training - Level 1 (Servant Leadership)',
        description: 'Learn to lead like Jesus with humility and integrity',
        icon: '🧭',
        level: 1,
        track_type: 'leadership',
        order: 4,
      });

      // Leadership Level 2
      const leadershipTrack2 = await base44.entities.TrainingTrack.create({
        name: 'Leadership Training - Level 2 (Ministry Skills)',
        description: 'Develop practical ministry and teaching skills',
        icon: '⚙️',
        level: 2,
        track_type: 'leadership',
        order: 5,
      });

      // Leadership Level 3
      const leadershipTrack3 = await base44.entities.TrainingTrack.create({
        name: 'Leadership Training - Level 3 (Ministry Oversight)',
        description: 'Advanced ministry oversight, organizational leadership, and legacy',
        icon: '👑',
        level: 3,
        track_type: 'leadership',
        order: 6,
      });

      // ========== BIBLICAL LEVEL 1 COURSE ==========
      const biblicalCourse1 = await base44.entities.TrainingCourse.create({
        track_id: biblicalTrack1.id,
        title: 'Foundations of Faith',
        description: 'Core lessons on Bible basics, God, Jesus, salvation, and Christian living',
        order: 1,
        pass_score: 80,
        estimated_hours: 10,
      });

      // ========== BIBLICAL LEVEL 2 COURSE ==========
      const biblicalCourse2 = await base44.entities.TrainingCourse.create({
        track_id: biblicalTrack2.id,
        title: 'Core Doctrines',
        description: 'Trinity, Christology, Soteriology, Eschatology, and Spiritual Warfare',
        order: 1,
        pass_score: 80,
        estimated_hours: 12,
      });

      // ========== BIBLICAL LEVEL 3 COURSE ==========
      const biblicalCourse3 = await base44.entities.TrainingCourse.create({
        track_id: biblicalTrack3.id,
        title: 'Discipleship & Mission',
        description: 'Spiritual maturity, evangelism, missions, and Christian ethics',
        order: 1,
        pass_score: 80,
        estimated_hours: 12,
      });

      // ========== LEADERSHIP LEVEL 1 COURSES (8 Biblical Leadership Courses) ==========
      const leadershipCourse1_1 = await base44.entities.TrainingCourse.create({
        track_id: leadershipTrack1.id,
        title: 'Servant Leadership (Jesus Model)',
        description: 'Leaders serve first, not rule first. Learn to influence through love.',
        order: 1,
        pass_score: 80,
        estimated_hours: 3,
      });

      const leadershipCourse1_2 = await base44.entities.TrainingCourse.create({
        track_id: leadershipTrack1.id,
        title: 'Character & Integrity Leadership',
        description: 'Who you are matters more than what you do.',
        order: 2,
        pass_score: 80,
        estimated_hours: 3,
      });

      // ========== LEADERSHIP LEVEL 2 COURSE ==========
      const leadershipCourse2 = await base44.entities.TrainingCourse.create({
        track_id: leadershipTrack2.id,
        title: 'Ministry Leadership & Impact',
        description: 'Equip growing leaders to serve teams, handle responsibility, communicate vision, and mentor others—with Christlike character and accountability.',
        order: 1,
        pass_score: 80,
        estimated_hours: 8,
      });

      // ========== LEADERSHIP LEVEL 3 COURSE ==========
      const leadershipCourse3 = await base44.entities.TrainingCourse.create({
        track_id: leadershipTrack3.id,
        title: 'Advanced Leadership & Ministry Oversight',
        description: 'Prepare for oversight roles, organizational leadership, doctrinal responsibility, and long-term ministry impact.',
        order: 1,
        pass_score: 80,
        estimated_hours: 12,
      });

      // Create 15 Lessons
      const lessons = [
        { title: 'What Is the Bible?', content: '## What Is the Bible?\n\n### What the Bible Is\nThe Bible is God\'s inspired Word, written by human authors guided by the Holy Spirit. It contains 66 books divided into the Old Testament (39 books) and New Testament (27 books).\n\n### Old Testament vs New Testament\n- **Old Testament**: The promise of a Savior, the law, history of Israel, prophecies\n- **New Testament**: The fulfillment in Jesus Christ, the early church, Christian teaching\n\n### Why the Bible Is Trustworthy\n- Written over 1,500 years by 40+ authors with one unified message\n- Historically accurate and archaeologically verified\n- Prophetically fulfilled\n- Life-transforming power for billions throughout history\n\n**Key Verse**: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness." - 2 Timothy 3:16', scripture: ['2 Timothy 3:16', 'Hebrews 4:12'] },
        { title: 'How to Read the Bible', content: '## How to Read the Bible\n\n### Where to Start\nIf you\'re new to the Bible, start with the Gospel of John, then read Romans, and Genesis. Build from there.\n\n### Reading with Prayer\nAlways ask the Holy Spirit to help you understand. Prayer opens your heart to God\'s voice.\n\n### Understanding Context\n- Who wrote it? To whom? Why?\n- What was the culture and historical setting?\n- What type of literature is it? (History, poetry, prophecy, letter)\n\n**Practical Tips**:\n1. Read consistently, even if just 10 minutes a day\n2. Use a journal to write down what you learn\n3. Apply what you read to your life\n\n**Key Verse**: "Your word is a lamp for my feet, a light on my path." - Psalm 119:105', scripture: ['Psalm 119:105', 'Joshua 1:8'] },
        { title: 'Who Is God?', content: '## Who Is God?\n\n### God the Father\nGod is the eternal, all-powerful, all-knowing Creator of the universe. He exists in three persons: Father, Son (Jesus), and Holy Spirit—one God in three persons (the Trinity).\n\n### God\'s Attributes\n- **Love**: God\'s very nature is love (1 John 4:8)\n- **Holiness**: God is perfectly pure and set apart from sin\n- **Power**: Nothing is impossible for God\n- **Faithfulness**: God always keeps His promises\n- **Justice**: God is fair and righteous in all His ways\n- **Mercy**: God shows compassion and forgiveness\n\n### Personal Relationship\nGod is not distant—He desires to know you personally through Jesus Christ.\n\n**Key Verses**: "God is love." - 1 John 4:8 | "Holy, holy, holy is the Lord God Almighty." - Revelation 4:8', scripture: ['1 John 4:8', 'Exodus 34:6-7', 'Revelation 4:8'] },
        { title: 'Jesus Christ', content: '## Jesus Christ\n\n### Who Jesus Is\nJesus is the Son of God, fully God and fully man. He is the second person of the Trinity, the promised Messiah prophesied in the Old Testament.\n\n### Why He Came\nJesus came to:\n- Reveal God to us\n- Live a perfect life as our example\n- Die on the cross to pay for our sins\n- Rise from the dead to defeat death\n\n### His Death and Resurrection\nJesus willingly died on the cross, taking the punishment for our sins. Three days later, He rose from the dead, proving His power over sin and death.\n\n**The Gospel**: We are saved by grace through faith in Jesus—not by our good works.\n\n**Key Verse**: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." - John 3:16', scripture: ['John 3:16', 'Romans 5:8', '1 Corinthians 15:3-4'] },
        { title: 'The Holy Spirit', content: '## The Holy Spirit\n\n### Who the Holy Spirit Is\nThe Holy Spirit is the third person of the Trinity, fully God. He is not a force or energy—He is a person with will, emotions, and intellect.\n\n### His Role in the Believer\'s Life\n- **Convicts of sin**: Helps us see our need for Jesus\n- **Seals us**: Guarantees our salvation\n- **Guides us**: Leads us into truth and wisdom\n- **Empowers us**: Gives us strength to live for God\n- **Produces fruit**: Develops Christ-like character in us (Galatians 5:22-23)\n- **Gives gifts**: Equips us for ministry and service\n\n**Key Promise**: When we trust in Jesus, the Holy Spirit comes to live inside us.\n\n**Key Verse**: "But the Helper, the Holy Spirit, whom the Father will send in my name, he will teach you all things." - John 14:26', scripture: ['John 14:26', 'Acts 1:8', 'Galatians 5:22-23'] },
        { title: 'Salvation', content: '## Salvation\n\n### Sin and Grace\n- **Sin**: All have sinned and fall short of God\'s glory (Romans 3:23). Sin separates us from God.\n- **Grace**: God\'s undeserved favor. We cannot earn salvation—it\'s a free gift from God.\n\n### Faith, Repentance, and Salvation\n1. **Admit**: Recognize you are a sinner and need Jesus\n2. **Believe**: Trust that Jesus died for your sins and rose again\n3. **Confess**: Surrender your life to Jesus as Lord\n4. **Repent**: Turn away from sin and follow Jesus\n\n**You are saved by grace through faith, not by works** (Ephesians 2:8-9).\n\n### Assurance\nOnce saved, you are secure in Christ. Nothing can separate you from God\'s love (Romans 8:38-39).\n\n**Key Verse**: "If you declare with your mouth, \'Jesus is Lord,\' and believe in your heart that God raised him from the dead, you will be saved." - Romans 10:9', scripture: ['Romans 3:23', 'Romans 6:23', 'Ephesians 2:8-9', 'Romans 10:9'] },
        { title: 'Prayer', content: '## Prayer\n\n### Why We Pray\nPrayer is talking with God. It\'s how we build our relationship with Him, express our needs, worship, and listen for His guidance.\n\n### How Jesus Taught Prayer\nJesus gave us the Lord\'s Prayer (Matthew 6:9-13) as a model:\n- **Worship**: "Our Father in heaven, hallowed be your name"\n- **Surrender**: "Your kingdom come, your will be done"\n- **Provision**: "Give us today our daily bread"\n- **Forgiveness**: "Forgive us our debts"\n- **Protection**: "Lead us not into temptation"\n\n### Prayer in Practice\n- Be honest and humble\n- Pray with faith, believing God hears you\n- Pray continually (1 Thessalonians 5:17)\n- Pray in Jesus\' name\n\n**Key Verse**: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6', scripture: ['Matthew 6:9-13', 'Philippians 4:6', '1 Thessalonians 5:17'] },
        { title: 'Worship', content: '## Worship\n\n### Worship as a Lifestyle\nWorship isn\'t just singing songs on Sunday. It\'s living every moment for God\'s glory—with your thoughts, words, actions, and heart.\n\n### Praise and Obedience\n- **Praise**: Expressing gratitude and adoration to God\n- **Obedience**: True worship includes obeying God\'s Word\n\n"If you love me, keep my commands." - John 14:15\n\n### Corporate Worship\nGathering with other believers to worship God together is vital for spiritual growth and encouragement.\n\n**Key Verse**: "Therefore, I urge you, brothers and sisters, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship." - Romans 12:1', scripture: ['Romans 12:1', 'Psalm 95:1-7', 'John 4:23-24'] },
        { title: 'Faith and Trust in God', content: '## Faith and Trust in God\n\n### Faith in Trials\nFaith is trusting God even when circumstances are difficult. Trials test and strengthen our faith (James 1:2-4).\n\n### Trusting God Daily\n- Trust God\'s character, not just your circumstances\n- Remember God\'s past faithfulness\n- Pray and cast your anxieties on Him (1 Peter 5:7)\n\n### Biblical Examples\n- **Abraham**: Trusted God\'s promise even when it seemed impossible\n- **David**: Faced Goliath with faith in God\n- **Job**: Remained faithful through suffering\n\n**Key Verse**: "Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5-6', scripture: ['Proverbs 3:5-6', 'Hebrews 11:1', 'James 1:2-4'] },
        { title: 'Christian Identity', content: '## Christian Identity\n\n### New Life in Christ\nWhen you trust in Jesus, you become a new creation (2 Corinthians 5:17). Your old self is gone; you are now:\n- A child of God (John 1:12)\n- Forgiven and free from condemnation (Romans 8:1)\n- Righteous in Christ (2 Corinthians 5:21)\n- An ambassador for Christ (2 Corinthians 5:20)\n\n### Living as God\'s Child\n- Walk by the Spirit, not by the flesh\n- Reflect God\'s love and holiness\n- Live with purpose and hope\n\n**Key Verse**: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" - 2 Corinthians 5:17', scripture: ['2 Corinthians 5:17', 'John 1:12', 'Romans 8:1'] },
        { title: 'The Church', content: '## The Church\n\n### Purpose of the Church\nThe Church is not a building—it\'s the body of believers in Jesus Christ. The Church exists to:\n- Worship God\n- Make disciples\n- Encourage and equip believers\n- Show God\'s love to the world\n\n### Fellowship and Unity\nGod calls us to be in community with other believers. We need each other for growth, accountability, and encouragement.\n\n"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together." - Hebrews 10:24-25\n\n**Key Verse**: "Now you are the body of Christ, and each one of you is a part of it." - 1 Corinthians 12:27', scripture: ['1 Corinthians 12:27', 'Hebrews 10:24-25', 'Acts 2:42-47'] },
        { title: 'Love and Forgiveness', content: '## Love and Forgiveness\n\n### Loving Others\nJesus commanded us to love one another as He has loved us (John 13:34). This love is:\n- Sacrificial (putting others first)\n- Unconditional (not based on worthiness)\n- Action-oriented (shown through deeds, not just words)\n\n### Forgiving as Christ Forgave\nGod has forgiven us completely through Christ. Therefore, we must forgive others—not because they deserve it, but because God commands it.\n\n"Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you." - Colossians 3:13\n\n### Letting Go of Bitterness\nUnforgiveness hurts you more than the other person. Choose forgiveness and trust God with justice.\n\n**Key Verse**: "A new command I give you: Love one another. As I have loved you, so you must love one another." - John 13:34', scripture: ['John 13:34', 'Colossians 3:13', 'Matthew 6:14-15'] },
        { title: 'Christian Character', content: '## Christian Character\n\n### Fruit of the Spirit\nAs the Holy Spirit works in us, He produces godly character (Galatians 5:22-23):\n- Love\n- Joy\n- Peace\n- Patience\n- Kindness\n- Goodness\n- Faithfulness\n- Gentleness\n- Self-control\n\n### Integrity and Holiness\n- **Integrity**: Living consistently according to God\'s Word, even when no one is watching\n- **Holiness**: Being set apart for God, pursuing purity in thought and action\n\n"Be holy, because I am holy." - 1 Peter 1:16\n\n**Key Verse**: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control." - Galatians 5:22-23', scripture: ['Galatians 5:22-23', '1 Peter 1:15-16', 'Colossians 3:12-14'] },
        { title: 'Heaven, Hell, and Eternal Life', content: '## Heaven, Hell, and Eternal Life\n\n### Biblical Teaching on Eternity\n- **Heaven**: The eternal home of all who trust in Jesus. A place of joy, peace, and perfect fellowship with God.\n- **Hell**: Eternal separation from God for those who reject Jesus. A place of suffering and regret.\n\n### The Reality\nEternity is real. Every person will spend eternity in one of two places—with God or separated from Him.\n\n### The Choice\nGod desires all people to be saved (2 Peter 3:9). Jesus is the only way to eternal life (John 14:6).\n\n"Whoever believes in the Son has eternal life, but whoever rejects the Son will not see life, for God\'s wrath remains on them." - John 3:36\n\n**Key Verse**: "Jesus answered, \'I am the way and the truth and the life. No one comes to the Father except through me.\'" - John 14:6', scripture: ['John 14:6', 'Revelation 21:1-4', 'Matthew 25:46'] },
        { title: 'Living the Christian Life', content: '## Living the Christian Life\n\n### Obedience\nTrue faith results in obedience to God\'s Word. Obedience isn\'t legalism—it\'s a response of love.\n\n"If you love me, keep my commands." - John 14:15\n\n### Growth and Perseverance\n- **Growth**: Spiritual maturity takes time. Stay in God\'s Word, pray, and fellowship with believers.\n- **Perseverance**: Don\'t give up when times are hard. God is faithful to complete the work He started in you (Philippians 1:6).\n\n### Daily Walk\n- Read the Bible daily\n- Pray continually\n- Attend church\n- Serve others\n- Share the Gospel\n\n**Key Verse**: "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus." - Philippians 1:6', scripture: ['Philippians 1:6', 'John 14:15', '2 Peter 3:18'] },
      ];

      // Create Biblical Level 1 Lessons
      for (let i = 0; i < lessons.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: biblicalCourse1.id,
          title: `Lesson ${i + 1} — ${lessons[i].title}`,
          content: lessons[i].content,
          scripture_references: lessons[i].scripture,
          order: i + 1,
          estimated_minutes: 20,
        });
      }

      // Create Biblical Level 2 Lessons (Doctrine)
      const doctrineTopics = [
        'Who is God? (Trinity)', 'The Nature of God', 'Jesus Christ - Person and Work', 'The Holy Spirit in Depth',
        'Scripture and Revelation', 'Sin and the Fall', 'Salvation by Grace', 'Justification and Sanctification',
        'The Church and Sacraments', 'Angels and Demons', 'Heaven, Hell, and Judgment', 'The Second Coming'
      ];
      for (let i = 0; i < doctrineTopics.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: biblicalCourse2.id,
          title: `Lesson ${i + 1} — ${doctrineTopics[i]}`,
          content: `## ${doctrineTopics[i]}\n\nDeep theological study of ${doctrineTopics[i]}. This lesson covers biblical foundations, historical church teaching, and practical application.`,
          scripture_references: ['Romans 8:28', '2 Timothy 3:16'],
          order: i + 1,
          estimated_minutes: 25,
        });
      }

      // Create Biblical Level 3 Lessons (Discipleship)
      const discipleshipTopics = [
        'Fruit of the Spirit', 'Faith in Trials', 'Evangelism Basics', 'Sharing Your Testimony',
        'Making Disciples', 'Christian Ethics', 'Cultural Engagement', 'Missions and the Great Commission',
        'Apologetics Basics', 'Spiritual Disciplines', 'Suffering and Persecution', 'Kingdom Living'
      ];
      for (let i = 0; i < discipleshipTopics.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: biblicalCourse3.id,
          title: `Lesson ${i + 1} — ${discipleshipTopics[i]}`,
          content: `## ${discipleshipTopics[i]}\n\nAdvanced training in ${discipleshipTopics[i]}. Equipping believers for maturity, mission, and ministry.`,
          scripture_references: ['Matthew 28:19-20', 'Galatians 5:22-23'],
          order: i + 1,
          estimated_minutes: 30,
        });
      }

      // ========== COURSE 1: Servant Leadership ==========
      const servantLessons = [
        { title: 'Leaders Serve First', content: '## Leaders Serve First\n\nJesus redefined leadership: "Whoever wants to become great among you must be your servant" (Mark 10:43). True greatness is measured by how we serve, not by power or position.\n\n**Key Principle**: Influence through love, not control.', scripture: ['Mark 10:42-45', 'John 13:12-15'] },
        { title: 'Humility Before Authority', content: '## Humility Before Authority\n\nHumility is not weakness—it is strength under control. Jesus, though King, washed His disciples feet. Leaders must put people before position.\n\n**Application**: How can you serve someone today?', scripture: ['Matthew 20:26-28', 'Philippians 2:3-8'] },
        { title: 'Leading by Example', content: '## Leading by Example\n\nPeople follow what you do, not just what you say. Jesus lived what He taught. Your life is your leadership message.\n\n**Reflection**: What example are you setting?', scripture: ['1 Peter 5:3', '1 Corinthians 11:1'] },
      ];
      for (let i = 0; i < servantLessons.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: leadershipCourse1_1.id,
          title: `Lesson ${i + 1} — ${servantLessons[i].title}`,
          content: servantLessons[i].content,
          scripture_references: servantLessons[i].scripture,
          order: i + 1,
          estimated_minutes: 25,
        });
      }

      // ========== COURSE 2: Character & Integrity ==========
      const characterLessons = [
        { title: 'Faithfulness in Small Things', content: '## Faithfulness in Small Things\n\n"Whoever can be trusted with very little can also be trusted with much" (Luke 16:10). God tests us in the small before giving us the large.\n\n**Action**: Be faithful where you are now.', scripture: ['Luke 16:10', '1 Samuel 16:7'] },
        { title: 'Integrity Under Pressure', content: '## Integrity Under Pressure\n\nIntegrity means doing right even when no one is watching. Joseph maintained integrity in Potiphar house and in prison.\n\n**Question**: Will you stay faithful in the hidden seasons?', scripture: ['Proverbs 11:3', 'Genesis 39:7-9'] },
        { title: 'Heart Over Appearance', content: '## Heart Over Appearance\n\n"The Lord looks at the heart" (1 Samuel 16:7). God values character over charisma, motive over ministry size.\n\n**Examine**: What is the condition of your heart?', scripture: ['1 Samuel 16:7', 'Proverbs 4:23'] },
      ];
      for (let i = 0; i < characterLessons.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: leadershipCourse1_2.id,
          title: `Lesson ${i + 1} — ${characterLessons[i].title}`,
          content: characterLessons[i].content,
          scripture_references: characterLessons[i].scripture,
          order: i + 1,
          estimated_minutes: 25,
        });
      }

      // ========== LEADERSHIP LEVEL 2: Ministry Leadership & Impact (10 Lessons) ==========
      const ministryLeadershipLessons = [
        { 
          title: 'Calling, Identity & Responsibility', 
          content: '## Calling, Identity & Responsibility\n\nLeadership flows from calling. Before leading others, leaders must understand who they are in Christ and the responsibility they carry.\n\n### Key Teaching Points\n- Leadership as a calling, not a title\n- Faithfulness to God\'s assignment\n- Responsibility before recognition\n\n### Reflection\nHow has God called you to serve others right now?', 
          scripture: ['Romans 11:29', '1 Peter 4:10', 'Colossians 3:23'] 
        },
        { 
          title: 'Vision Casting & Direction', 
          content: '## Vision Casting & Direction\n\nLeaders help people see where God is leading and inspire them to move forward together.\n\n### Key Teaching Points\n- Communicating God\'s vision clearly\n- Aligning people with purpose\n- Staying faithful to God\'s direction\n\n### Reflection\nCan people clearly understand the vision God has given you?', 
          scripture: ['Proverbs 29:18', 'Nehemiah 2:17-18', 'Habakkuk 2:2'] 
        },
        { 
          title: 'Leading Teams & Building Unity', 
          content: '## Leading Teams & Building Unity\n\nEffective leadership builds unity, values diversity, and promotes cooperation.\n\n### Key Teaching Points\n- Unity over division\n- Respecting different gifts\n- Working together in love\n\n### Reflection\nHow do you promote unity among those you lead?', 
          scripture: ['Ephesians 4:1-3', '1 Corinthians 12:12', 'Psalm 133:1'] 
        },
        { 
          title: 'Communication & Teaching Leadership', 
          content: '## Communication & Teaching Leadership\n\nGodly leaders speak with wisdom, clarity, and grace.\n\n### Key Teaching Points\n- Speaking truth in love\n- Listening before responding\n- Teaching with clarity and humility\n\n### Reflection\nAre your words building faith or creating confusion?', 
          scripture: ['James 1:19', 'Proverbs 15:1', '2 Timothy 2:24'] 
        },
        { 
          title: 'Conflict Resolution & Peacemaking', 
          content: '## Conflict Resolution & Peacemaking\n\nLeadership requires handling conflict with wisdom, humility, and biblical love.\n\n### Key Teaching Points\n- Addressing issues early\n- Restoring relationships\n- Seeking peace without compromise\n\n### Reflection\nHow do you respond when conflict arises?', 
          scripture: ['Matthew 18:15', 'Romans 12:18', 'Proverbs 20:3'] 
        },
        { 
          title: 'Stewardship & Accountability', 
          content: '## Stewardship & Accountability\n\nLeaders manage what God entrusts to them—time, people, resources—with faithfulness.\n\n### Key Teaching Points\n- Faithful stewardship\n- Transparency and accountability\n- Responsibility before God\n\n### Reflection\nHow are you stewarding what God has placed in your care?', 
          scripture: ['Luke 16:10-11', '1 Corinthians 4:2', 'Hebrews 13:17'] 
        },
        { 
          title: 'Leadership Under Pressure', 
          content: '## Leadership Under Pressure\n\nMature leaders remain steady, prayerful, and faithful during challenges.\n\n### Key Teaching Points\n- Leading calmly in stress\n- Trusting God in uncertainty\n- Strength through prayer\n\n### Reflection\nHow do you respond to pressure as a leader?', 
          scripture: ['Isaiah 41:10', 'Psalm 46:1', '2 Corinthians 4:16-18'] 
        },
        { 
          title: 'Mentoring & Developing Leaders', 
          content: '## Mentoring & Developing Leaders\n\nLeadership grows when leaders intentionally raise others.\n\n### Key Teaching Points\n- Coaching and encouragement\n- Delegating responsibility\n- Preparing others to lead\n\n### Reflection\nWho are you preparing to lead after you?', 
          scripture: ['2 Timothy 2:2', 'Proverbs 22:6', 'Titus 2:1'] 
        },
        { 
          title: 'Ethical Leadership & Integrity', 
          content: '## Ethical Leadership & Integrity\n\nLeaders must lead with honesty, purity, and moral courage.\n\n### Key Teaching Points\n- Integrity in decisions\n- Avoiding compromise\n- Honoring God publicly and privately\n\n### Reflection\nDo your actions reflect your faith consistently?', 
          scripture: ['Proverbs 10:9', 'Psalm 15:1-2', '1 Timothy 3:2'] 
        },
        { 
          title: 'Finishing Well & Long-Term Faithfulness', 
          content: '## Finishing Well & Long-Term Faithfulness\n\nTrue leadership is measured not by how we start, but how faithfully we finish.\n\n### Key Teaching Points\n- Perseverance in calling\n- Faithfulness over time\n- Leaving a godly legacy\n\n### Reflection\nWhat legacy of faith are you building?', 
          scripture: ['2 Timothy 4:7', 'Hebrews 12:1', 'Galatians 6:9'] 
        },
      ];
      
      // Role-specific variants for Leadership Level 2 lessons
      const roleVariants = [
        // Lesson 1: Calling, Identity & Responsibility
        {
          youth_leader: {
            examples: "**Scenario**: A teen leader wants a title more than service.\n\n**Example**: You notice a youth volunteer is more interested in being recognized as \"youth leader\" than actually serving teens. They post about their \"ministry\" on social media but rarely show up for events or check in on struggling students.",
            reflection_question: "Am I serving teens for God's glory or for attention?",
            application_points: [
              "Serve quietly; be consistent; disciple 1–2 teens weekly",
              "Show up and care, even when nobody claps",
              "Lead by example, not by seeking recognition"
            ]
          },
          elder: {
            examples: "**Scenario**: Church members push you to take sides.\n\n**Example**: Two influential families in the church are in conflict, and both approach you separately asking for your support. They want you to affirm their position and side against the other family.",
            reflection_question: "Do I lead with humility and fairness?",
            application_points: [
              "Stay neutral; seek truth + unity; pray before decisions",
              "Exercise oversight as stewardship, not ownership",
              "Lead with wisdom, not favoritism"
            ]
          },
          pastor: {
            examples: "**Scenario**: You feel pressure to please everyone.\n\n**Example**: Different groups in the church want different things—some want contemporary worship, others traditional. Some want more teaching, others more outreach. You feel pulled in every direction and exhausted trying to make everyone happy.",
            reflection_question: "Is my identity in Christ or in results?",
            application_points: [
              "Obey God first; protect your time; keep private devotion strong",
              "Your calling is faithfulness, not popularity",
              "Set boundaries to preserve your spiritual health"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Volunteers wait for direction but no one takes responsibility.\n\n**Example**: Your ministry team has a big event coming up, but nobody is stepping up to coordinate. Everyone is waiting for someone else to take charge, and critical tasks are falling through the cracks.",
            reflection_question: "Do I take initiative with a servant heart?",
            application_points: [
              "Define roles; show reliability; communicate clearly",
              "Take responsibility for small things—God grows trust",
              "Lead by serving, not by waiting"
            ]
          }
        },
        // Lesson 2: Vision Casting & Direction
        {
          youth_leader: {
            examples: "**Scenario**: Youth group feels bored and disconnected.\n\n**Example**: Attendance is dropping. Teens show up but seem disengaged. They're on their phones during teaching and don't participate in discussions. The energy and excitement that used to be there is gone.",
            reflection_question: "Can teens understand our purpose in one sentence?",
            application_points: [
              "Create a simple vision statement; balance fun + spiritual growth",
              "Set weekly goals that are clear and achievable",
              "Make vision clear and simple—youth need clarity"
            ]
          },
          elder: {
            examples: "**Scenario**: A ministry wants to start a program without alignment.\n\n**Example**: A passionate leader wants to launch a new ministry that sounds good but doesn't fit the church's mission. They're moving fast and gathering support before getting leadership approval.",
            reflection_question: "Does this vision build the whole church?",
            application_points: [
              "Check mission fit; ask questions; protect unity",
              "Use vision to protect the church from confusion",
              "Ensure all ministries align with the church's direction"
            ]
          },
          pastor: {
            examples: "**Scenario**: Too many good ideas compete for time.\n\n**Example**: Your leadership team is excited about multiple initiatives—a new outreach program, a prayer ministry, a youth relaunch, and a building project. Everyone wants their idea to be the priority, and you can't do everything at once.",
            reflection_question: "Am I leading people toward God's priorities?",
            application_points: [
              "Prioritize; communicate direction; pace the church",
              "Vision is direction plus patience",
              "Help people see the path, not just the destination"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Event planning is chaotic and last-minute.\n\n**Example**: Every event feels like organized chaos. Tasks are assigned the week before, people are confused about their roles, and no one has a clear picture of the overall plan. Stress is high and joy is low.",
            reflection_question: "Do we serve with purpose or just activity?",
            application_points: [
              "Plan timeline; assign owners; repeat vision for the event",
              "A clear plan is love for your team",
              "Good planning honors both God and your volunteers"
            ]
          }
        },
        // Lesson 3: Leading Teams & Building Unity
        {
          youth_leader: {
            examples: "**Scenario**: Volunteers disagree on how strict rules should be.\n\n**Example**: Some youth volunteers think you're too lenient with discipline, while others think you're too strict. The disagreement is causing tension and making it hard to lead with unity.",
            reflection_question: "Do I bring peace or add tension?",
            application_points: [
              "Set shared values; listen; choose unity + safety",
              "Unity doesn't mean everyone agrees—it means everyone honors",
              "Lead with clarity and grace"
            ]
          },
          elder: {
            examples: "**Scenario**: Ministry leaders compete for resources.\n\n**Example**: Multiple ministry leaders are requesting funding for their programs. There's not enough budget for everything, and some leaders are lobbying for their ministry to be prioritized. Tension is building.",
            reflection_question: "Do I protect unity over preference?",
            application_points: [
              "Practice fairness; transparency; collaboration",
              "Elders guard unity with wisdom",
              "Model generosity and kingdom-mindedness"
            ]
          },
          pastor: {
            examples: "**Scenario**: Leaders feel unseen and discouraged.\n\n**Example**: Your key leaders are serving faithfully but feeling burned out and unappreciated. Some are considering stepping down because they feel like their work goes unnoticed.",
            reflection_question: "Do I build leaders or burn them out?",
            application_points: [
              "Encourage; delegate; celebrate faithfulness",
              "Healthy teams grow through honor",
              "Invest in your leaders before they quit"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: People stop showing up on time.\n\n**Example**: Ministry team meetings and events are starting late because people consistently arrive 15-30 minutes after the scheduled time. It's affecting morale and making planning difficult.",
            reflection_question: "How can our team culture improve this month?",
            application_points: [
              "Set clear expectations; follow-up; kindness + firmness",
              "Reliability is a spiritual discipline",
              "Honor the time of those who show up on time"
            ]
          }
        },
        // Lesson 4: Communication & Teaching Leadership
        {
          youth_leader: {
            examples: "**Scenario**: Teens misunderstand your correction and feel attacked.\n\n**Example**: You corrected a student's behavior, but they took it personally and now feel like you don't like them. Other students are taking sides, and the situation has escalated.",
            reflection_question: "Do my words build trust with youth?",
            application_points: [
              "Use a gentle tone; simple language; ask questions",
              "Speak in a way teens can hear",
              "Correct behavior, not character"
            ]
          },
          elder: {
            examples: "**Scenario**: Sensitive issue discussed in meetings causes division.\n\n**Example**: A doctrinal or ministry decision has become contentious in elder meetings. Emotions are high, and the discussion is creating division instead of clarity.",
            reflection_question: "Do I communicate with wisdom and patience?",
            application_points: [
              "Clarify; keep calm; focus on Scripture + unity",
              "Slow speech, strong clarity",
              "Prioritize truth and peace together"
            ]
          },
          pastor: {
            examples: "**Scenario**: Preaching and announcements lack clarity.\n\n**Example**: People are confused about sermon applications or upcoming events because communication is too vague or rushed. Key information isn't sticking.",
            reflection_question: "Is my communication clear enough to act on?",
            application_points: [
              "Simplify; repeat key points; confirm understanding",
              "Clarity is kindness",
              "Say less, but say it better"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Last-minute changes weren't shared → confusion.\n\n**Example**: The event plan changed, but not everyone got the memo. Volunteers showed up expecting one thing and found something completely different. Frustration and chaos followed.",
            reflection_question: "What communication habit will we improve?",
            application_points: [
              "Use one channel; written plan; confirm assignments",
              "Say it, write it, confirm it",
              "Over-communicate important changes"
            ]
          }
        },
        // Lesson 5: Conflict Resolution & Peacemaking
        {
          youth_leader: {
            examples: "**Scenario**: Two teens fight; rumors spread on social media.\n\n**Example**: A conflict between two students has spilled onto social media. Other teens are getting involved, taking sides, and the situation is escalating online and in the youth group.",
            reflection_question: "Do I correct with love and protect trust?",
            application_points: [
              "Have a private talk; protect dignity; involve parents if needed",
              "Restore relationships; don't shame",
              "Address the issue quickly before it spreads"
            ]
          },
          elder: {
            examples: "**Scenario**: Conflict between families affects the church.\n\n**Example**: Two families in the church are in conflict, and it's affecting the entire congregation. People are choosing sides, and the tension is noticeable during services.",
            reflection_question: "Am I firm in truth and gentle in spirit?",
            application_points: [
              "Pray; meet biblically; seek restoration; document if needed",
              "Peacemaking is holy work",
              "Protect the church through wise intervention"
            ]
          },
          pastor: {
            examples: "**Scenario**: Counseling conflict; emotions are high.\n\n**Example**: You're mediating a conflict between church members, and emotions are running high. People are hurt, angry, and not listening to each other. You're caught in the middle.",
            reflection_question: "Do I shepherd with patience?",
            application_points: [
              "Listen; set boundaries; use Scripture wisely; refer when needed",
              "Peace without truth is weak; truth without love is harsh",
              "Guard your own heart while helping others"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Volunteer conflict before an event.\n\n**Example**: Two volunteers had a disagreement during setup, and now they're not speaking to each other. The event starts in an hour, and the tension is affecting the whole team.",
            reflection_question: "How can we prevent this next time?",
            application_points: [
              "Have a calm conversation; clarify roles; forgive quickly",
              "Conflict handled well builds trust",
              "Address issues immediately, not later"
            ]
          }
        },
        // Lesson 6: Stewardship & Accountability
        {
          youth_leader: {
            examples: "**Scenario**: Youth budget isn't tracked; resources wasted.\n\n**Example**: Money for youth events and supplies is being spent without clear tracking. Some volunteers are overspending, others are confused about what's available, and there's no accountability system.",
            reflection_question: "Am I trustworthy with small resources?",
            application_points: [
              "Create a simple budget; require approvals; report honestly",
              "Stewardship is worship",
              "Manage money like it belongs to God (because it does)"
            ]
          },
          elder: {
            examples: "**Scenario**: Questions about finances create suspicion.\n\n**Example**: Church members are asking questions about how funds are being used. Some are expressing concerns about transparency, and rumors are starting to spread about financial mismanagement.",
            reflection_question: "Do we model integrity as leaders?",
            application_points: [
              "Practice transparency; provide oversight; establish clear processes",
              "Accountability protects the church",
              "Address concerns quickly and openly"
            ]
          },
          pastor: {
            examples: "**Scenario**: Too many responsibilities cause burnout.\n\n**Example**: You're overcommitted and exhausted. Your calendar is packed, you're saying yes to everything, and you have no margin for rest or unexpected needs. Family time is suffering.",
            reflection_question: "Am I managing my time like it belongs to God?",
            application_points: [
              "Steward time; delegate; rest; set boundaries",
              "Rest is stewardship too",
              "You can't pour from an empty cup"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Supplies, schedules, and duties are disorganized.\n\n**Example**: No one knows where supplies are stored, schedules are unclear, and people are confused about their responsibilities. Every event feels like starting from scratch.",
            reflection_question: "What system will make us faithful?",
            application_points: [
              "Create a checklist; define roles; use a shared calendar; report simply",
              "Order helps people serve with joy",
              "Good systems free people to focus on ministry"
            ]
          }
        },
        // Lesson 7: Leadership Under Pressure
        {
          youth_leader: {
            examples: "**Scenario**: A crisis in youth group needs quick wisdom.\n\n**Example**: A student is in crisis—they just shared something serious that requires immediate attention. You need to respond wisely and quickly while following safety protocols.",
            reflection_question: "Do I run to God first under stress?",
            application_points: [
              "Stay calm; involve leaders; follow safety policy",
              "Pause, pray, then act",
              "Have a crisis response plan in place"
            ]
          },
          elder: {
            examples: "**Scenario**: Church faces public criticism or internal tension.\n\n**Example**: The church is facing criticism from the community or dealing with internal conflict that's threatening to divide the congregation. All eyes are on leadership to respond.",
            reflection_question: "Do I stabilize others with faith?",
            application_points: [
              "Pray; unify leadership; communicate carefully",
              "Steady leadership reduces fear",
              "Lead with calm assurance in God's sovereignty"
            ]
          },
          pastor: {
            examples: "**Scenario**: Heavy needs + criticism at the same time.\n\n**Example**: You're facing multiple urgent pastoral needs—funerals, hospital visits, counseling crises—while also receiving criticism about your preaching or leadership. You're emotionally drained and questioning your calling.",
            reflection_question: "Do I carry pressure with God, not alone?",
            application_points: [
              "Prioritize prayer; set counseling boundaries; seek trusted support",
              "You are not God—depend on God",
              "It's okay to ask for help"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Event problems happen; people blame each other.\n\n**Example**: Something went wrong at your event—equipment failed, volunteers didn't show up, or plans changed last minute. Team members are frustrated and starting to blame each other.",
            reflection_question: "How do we respond when plans fail?",
            application_points: [
              "Fix first; debrief later; stay respectful",
              "Pressure reveals culture—choose grace",
              "Solve problems together, not against each other"
            ]
          }
        },
        // Lesson 8: Mentoring & Developing Leaders
        {
          youth_leader: {
            examples: "**Scenario**: A teen wants to serve but lacks discipline.\n\n**Example**: A student is excited about serving in youth ministry but struggles with consistency. They miss meetings, forget commitments, and need a lot of follow-up.",
            reflection_question: "Who am I discipling intentionally?",
            application_points: [
              "Coach weekly; take small steps; encourage growth",
              "Mentoring is love with patience",
              "Invest in character, not just tasks"
            ]
          },
          elder: {
            examples: "**Scenario**: Ministry leaders need training and support.\n\n**Example**: You have capable leaders serving in various ministries, but they lack training and feel unsupported. Some are making avoidable mistakes, others are discouraged, and a few are considering stepping down.",
            reflection_question: "Am I raising future leaders or doing everything myself?",
            application_points: [
              "Build leaders; guide; correct gently",
              "Healthy churches multiply leaders",
              "Invest in leadership development regularly"
            ]
          },
          pastor: {
            examples: "**Scenario**: You lead leaders; some are insecure.\n\n**Example**: Some of your key leaders are insecure about their abilities and constantly need reassurance. They're hesitant to make decisions without your approval and struggle with confidence.",
            reflection_question: "Do I develop leaders or depend on them?",
            application_points: [
              "Empower; delegate; celebrate; correct privately",
              "A pastor's success includes successors",
              "Build leaders who can lead without you"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: New volunteers feel lost.\n\n**Example**: New volunteers show up excited to serve but have no idea what to do. They don't know the systems, where things are, or who to ask for help. Many don't come back after their first experience.",
            reflection_question: "How can we make serving easier for others?",
            application_points: [
              "Create onboarding; use a buddy system; provide simple training",
              "Train people so serving becomes joyful",
              "First impressions matter for volunteers"
            ]
          }
        },
        // Lesson 9: Ethical Leadership & Integrity
        {
          youth_leader: {
            examples: "**Scenario**: Youth leader tempted to be inappropriate in messages (boundaries).\n\n**Example**: A youth leader has been messaging students privately late at night, and the content is starting to feel too personal. Red flags are being raised about appropriate boundaries.",
            reflection_question: "Do I protect youth and my integrity?",
            application_points: [
              "Use safe communication; maintain transparency; use group chats; follow policies",
              "Integrity includes healthy boundaries",
              "Always protect yourself and the students you serve"
            ]
          },
          elder: {
            examples: "**Scenario**: Favoritism in decisions causes distrust.\n\n**Example**: Church members notice that certain families or individuals seem to get preferential treatment in decisions, opportunities, or resources. Trust in leadership is eroding.",
            reflection_question: "Do I lead with justice and humility?",
            application_points: [
              "Practice fairness; apply consistent standards; avoid bias",
              "Integrity builds trust across the church",
              "Treat everyone with equal dignity"
            ]
          },
          pastor: {
            examples: "**Scenario**: Temptations: pride, money, influence.\n\n**Example**: You're facing subtle temptations—pride when people praise you, financial pressure to make unwise decisions, or the temptation to use your influence for personal gain rather than God's glory.",
            reflection_question: "Do I guard my heart daily?",
            application_points: [
              "Have an accountability partner; use transparent systems; practice humility",
              "Private holiness protects public ministry",
              "Don't wait until you fall to build guardrails"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Volunteer shortcuts create safety issues.\n\n**Example**: Volunteers are taking shortcuts to save time—skipping safety checks, ignoring policies, or cutting corners on preparation. It's creating potential risks.",
            reflection_question: "Do we serve with excellence and honesty?",
            application_points: [
              "Do it right; follow rules; report problems",
              "Excellence is part of integrity",
              "How you do small things reveals your character"
            ]
          }
        },
        // Lesson 10: Finishing Well & Long-Term Faithfulness
        {
          youth_leader: {
            examples: "**Scenario**: Youth leader gets tired and wants to quit suddenly.\n\n**Example**: A passionate youth leader is burning out. They're exhausted from years of late nights, demanding students, and volunteer fatigue. They're ready to walk away without notice.",
            reflection_question: "What will help me serve faithfully for years?",
            application_points: [
              "Rest; share the load; maintain small habits",
              "Consistency matters more than intensity",
              "Build rhythms that sustain you long-term"
            ]
          },
          elder: {
            examples: "**Scenario**: Long service years create fatigue.\n\n**Example**: You've served as an elder for many years, and you're feeling the weight of it. The challenges seem harder, the joy feels distant, and you're questioning whether it's time to step down.",
            reflection_question: "Am I building a legacy of faith?",
            application_points: [
              "Renew vision; mentor younger leaders; maintain unity",
              "Finish with humility and peace",
              "Pass the baton well when it's time"
            ]
          },
          pastor: {
            examples: "**Scenario**: Ministry success leads to burnout risk.\n\n**Example**: The church is growing, ministry is fruitful, but you're running on empty. Success is demanding more of you, and you're neglecting your own spiritual health and family.",
            reflection_question: "Am I caring for my soul while caring for others?",
            application_points: [
              "Establish a Sabbath rhythm; maintain healthy boundaries; build strong support",
              "Finish well by walking with God daily",
              "Success without health is failure"
            ]
          },
          ministry_team: {
            examples: "**Scenario**: Serving becomes routine and joy fades.\n\n**Example**: Your ministry team has been serving together for years, but the joy is gone. Tasks feel like obligations, people are going through the motions, and passion has been replaced by duty.",
            reflection_question: "How can our team stay joyful in service?",
            application_points: [
              "Practice gratitude; rotate roles; celebrate testimonies",
              "Joy grows when purpose stays clear",
              "Remember why you started"
            ]
          }
        }
      ];

      for (let i = 0; i < ministryLeadershipLessons.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: leadershipCourse2.id,
          title: `Lesson ${i + 1} — ${ministryLeadershipLessons[i].title}`,
          content: ministryLeadershipLessons[i].content,
          scripture_references: ministryLeadershipLessons[i].scripture,
          order: i + 1,
          estimated_minutes: 30,
          audience_variants: roleVariants[i],
        });
      }

      // ========== LEADERSHIP LEVEL 3: Advanced Leadership & Ministry Oversight (12 Lessons) ==========
      const advancedLeadershipLessons = [
        {
          title: 'Spiritual Authority & Oversight',
          content: '## Spiritual Authority & Oversight\n\nSpiritual authority is given by God, not taken. Leaders must lead with humility, recognizing they are under God\'s authority.\n\n### Key Principles\n- Authority flows from submission to God\n- Oversight requires spiritual maturity\n- Leaders protect and guide those under their care\n\n### Reflection\nHow are you exercising spiritual authority in your sphere of influence?',
          scripture: ['1 Peter 5:1-4', 'Hebrews 13:17', 'Matthew 20:25-28']
        },
        {
          title: 'Doctrinal Soundness & Teaching Responsibility',
          content: '## Doctrinal Soundness & Teaching Responsibility\n\nLeaders must guard sound doctrine and teach truth faithfully. False teaching leads people astray.\n\n### Key Principles\n- Know the Word deeply\n- Teach with accuracy and conviction\n- Protect the flock from false doctrine\n\n### Reflection\nAre you equipped to teach and defend biblical truth?',
          scripture: ['2 Timothy 2:15', 'Titus 1:9', '1 Timothy 4:16']
        },
        {
          title: 'Organizational Leadership in Ministry',
          content: '## Organizational Leadership in Ministry\n\nEffective ministry requires structure, delegation, and clear systems. Leaders organize people and resources for maximum kingdom impact.\n\n### Key Principles\n- Clear structure enables mission\n- Delegation multiplies impact\n- Systems support sustainability\n\n### Reflection\nHow are you organizing ministry for long-term effectiveness?',
          scripture: ['Exodus 18:13-27', '1 Corinthians 14:40', 'Acts 6:1-7']
        },
        {
          title: 'Church Governance & Accountability',
          content: '## Church Governance & Accountability\n\nBiblical governance protects the church and ensures accountability. Leaders serve under God\'s authority and the oversight of others.\n\n### Key Principles\n- Elders govern with plural leadership\n- Accountability prevents abuse\n- Transparency builds trust\n\n### Reflection\nWho holds you accountable in ministry?',
          scripture: ['Acts 14:23', '1 Timothy 3:1-7', 'Hebrews 13:17']
        },
        {
          title: 'Shepherding Leaders & Teams',
          content: '## Shepherding Leaders & Teams\n\nLeaders shepherd other leaders, not just congregations. Caring for your leadership team is essential for healthy ministry.\n\n### Key Principles\n- Leaders need care and encouragement\n- Develop leaders intentionally\n- Protect team unity\n\n### Reflection\nHow are you shepherding your leadership team?',
          scripture: ['1 Peter 5:2-3', 'Ephesians 4:11-13', 'Acts 20:28']
        },
        {
          title: 'Handling Influence & Power',
          content: '## Handling Influence & Power\n\nPower and influence can corrupt. Leaders must steward authority with humility and integrity.\n\n### Key Principles\n- Power is for service, not self\n- Influence carries responsibility\n- Humility guards against pride\n\n### Reflection\nHow are you handling the influence God has given you?',
          scripture: ['Luke 22:25-27', '1 Peter 5:3', 'Proverbs 16:18']
        },
        {
          title: 'Crisis & Risk Leadership',
          content: '## Crisis & Risk Leadership\n\nCrises reveal leadership. Leaders must navigate uncertainty, make tough decisions, and guide people through trials.\n\n### Key Principles\n- Stay calm and trust God\n- Make decisions with wisdom\n- Communicate clearly in crisis\n\n### Reflection\nHow do you lead when everything is uncertain?',
          scripture: ['Nehemiah 4:14', 'Psalm 46:1-3', 'Isaiah 41:10']
        },
        {
          title: 'Financial & Resource Stewardship',
          content: '## Financial & Resource Stewardship\n\nLeaders manage resources with integrity and transparency. Faithful stewardship honors God and builds trust.\n\n### Key Principles\n- Transparency in finances\n- Generosity reflects God\'s character\n- Wise planning ensures sustainability\n\n### Reflection\nHow are you stewarding ministry resources?',
          scripture: ['1 Corinthians 4:2', 'Luke 16:10-11', 'Proverbs 21:5']
        },
        {
          title: 'Ethical Challenges in Leadership',
          content: '## Ethical Challenges in Leadership\n\nLeaders face ethical dilemmas. Maintaining biblical integrity in complex situations requires wisdom and courage.\n\n### Key Principles\n- Biblical principles guide decisions\n- Integrity over convenience\n- Seek godly counsel\n\n### Reflection\nWhat ethical challenges are you facing?',
          scripture: ['Daniel 1:8', 'Proverbs 11:3', '1 Timothy 3:2']
        },
        {
          title: 'Mentoring Senior Leaders',
          content: '## Mentoring Senior Leaders\n\nExperienced leaders mentor the next generation of senior leadership. This requires wisdom, patience, and intentionality.\n\n### Key Principles\n- Share wisdom and experience\n- Prepare successors\n- Build lasting legacy\n\n### Reflection\nWho are you preparing for senior leadership?',
          scripture: ['2 Timothy 2:2', '1 Kings 19:19-21', 'Proverbs 27:17']
        },
        {
          title: 'Protecting Unity & Doctrine',
          content: '## Protecting Unity & Doctrine\n\nLeaders guard both unity and truth. Protecting doctrine without sacrificing love is the leader\'s responsibility.\n\n### Key Principles\n- Unity around truth, not compromise\n- Address false teaching quickly\n- Love and truth together\n\n### Reflection\nHow are you protecting both unity and truth?',
          scripture: ['Ephesians 4:3', 'Jude 1:3', 'Titus 1:9']
        },
        {
          title: 'Legacy Leadership & Succession',
          content: '## Legacy Leadership & Succession\n\nGodly leaders plan for succession. Leadership legacy is measured by who continues after you.\n\n### Key Principles\n- Prepare successors intentionally\n- Transition with humility\n- Leave a godly legacy\n\n### Reflection\nWhat leadership legacy are you leaving?',
          scripture: ['2 Timothy 4:6-8', 'Joshua 1:1-9', 'Acts 20:32']
        },
      ];

      for (let i = 0; i < advancedLeadershipLessons.length; i++) {
        await base44.entities.TrainingLesson.create({
          course_id: leadershipCourse3.id,
          title: `Lesson ${i + 1} — ${advancedLeadershipLessons[i].title}`,
          content: advancedLeadershipLessons[i].content,
          scripture_references: advancedLeadershipLessons[i].scripture,
          order: i + 1,
          estimated_minutes: 35,
        });
      }

      // Create Quizzes for all courses
      const quiz1 = await base44.entities.TrainingQuiz.create({
        course_id: biblicalCourse1.id,
        title: 'Biblical Training Level 1 Quiz',
        description: 'Test your understanding of foundational Christian beliefs',
        pass_score: 80,
        allow_retake: true,
      });

      const quiz2 = await base44.entities.TrainingQuiz.create({
        course_id: biblicalCourse2.id,
        title: 'Biblical Training Level 2 Quiz',
        description: 'Test your understanding of core Christian doctrines',
        pass_score: 80,
        allow_retake: true,
      });

      const quiz3 = await base44.entities.TrainingQuiz.create({
        course_id: biblicalCourse3.id,
        title: 'Biblical Training Level 3 Quiz',
        description: 'Test your discipleship and mission knowledge',
        pass_score: 80,
        allow_retake: true,
      });

      // Create quizzes for each leadership course
      await base44.entities.TrainingQuiz.create({
        course_id: leadershipCourse1_1.id,
        title: 'Servant Leadership Quiz',
        description: 'Test your understanding of servant leadership principles',
        pass_score: 80,
        allow_retake: true,
      });

      await base44.entities.TrainingQuiz.create({
        course_id: leadershipCourse1_2.id,
        title: 'Character & Integrity Quiz',
        description: 'Test your understanding of godly character',
        pass_score: 80,
        allow_retake: true,
      });

      const leadershipLevel2Quiz = await base44.entities.TrainingQuiz.create({
        course_id: leadershipCourse2.id,
        title: 'Ministry Leadership & Impact Quiz',
        description: 'Test your understanding of ministry leadership principles',
        pass_score: 80,
        allow_retake: true,
      });

      // Create 100 questions for Leadership Level 2 Quiz
      const level2QuizQuestions = [
        // Calling & Identity
        { question: 'Leadership calling comes primarily from:', options: ['People', 'Position', 'God', 'Experience'], correct: 2, category: 'Calling' },
        { question: 'True or False: Leadership responsibility begins after recognition.', options: ['True', 'False'], correct: 1, category: 'Calling' },
        { question: 'A leader\'s identity should be rooted in:', options: ['Success', 'Christ', 'Authority', 'Popularity'], correct: 1, category: 'Calling' },
        { question: 'Faithfulness means:', options: ['Doing what is easy', 'Doing what God assigns', 'Waiting for promotion', 'Avoiding responsibility'], correct: 1, category: 'Calling' },
        { question: 'True or False: God calls leaders based on their perfection.', options: ['True', 'False'], correct: 1, category: 'Calling' },
        { question: 'Responsibility in leadership means:', options: ['Control', 'Accountability before God', 'Power', 'Independence'], correct: 1, category: 'Calling' },
        { question: 'A biblical leader serves:', options: ['Themselves first', 'God and others', 'Only those they like', 'Their own vision'], correct: 1, category: 'Calling' },
        { question: 'True or False: Leadership is about position, not character.', options: ['True', 'False'], correct: 1, category: 'Calling' },
        { question: 'God measures leaders by:', options: ['Results', 'Faithfulness', 'Influence', 'Wealth'], correct: 1, category: 'Calling' },
        { question: 'True or False: All believers have a calling from God.', options: ['True', 'False'], correct: 0, category: 'Calling' },
        
        // Vision & Direction
        { question: 'Vision helps people:', options: ['Compete', 'Complain', 'Move with purpose', 'Wait'], correct: 2, category: 'Vision' },
        { question: 'True or False: God\'s vision always requires faith.', options: ['True', 'False'], correct: 0, category: 'Vision' },
        { question: 'A leader communicates vision by:', options: ['Controlling others', 'Explaining purpose clearly', 'Demanding obedience', 'Keeping plans secret'], correct: 1, category: 'Vision' },
        { question: 'Biblical vision comes from:', options: ['Human strategy', 'God\'s direction', 'Popular opinion', 'Personal ambition'], correct: 1, category: 'Vision' },
        { question: 'True or False: Vision requires patience and trust.', options: ['True', 'False'], correct: 0, category: 'Vision' },
        { question: 'Casting vision involves:', options: ['Force', 'Inspiration', 'Manipulation', 'Control'], correct: 1, category: 'Vision' },
        { question: 'A clear vision helps teams:', options: ['Compete', 'Stay aligned', 'Work independently', 'Argue'], correct: 1, category: 'Vision' },
        { question: 'True or False: Vision without action is just a dream.', options: ['True', 'False'], correct: 0, category: 'Vision' },
        { question: 'Leaders stay faithful to vision by:', options: ['Giving up easily', 'Trusting God', 'Changing constantly', 'Ignoring feedback'], correct: 1, category: 'Vision' },
        { question: 'True or False: God\'s vision is always easy to fulfill.', options: ['True', 'False'], correct: 1, category: 'Vision' },
        
        // Teams & Unity
        { question: 'Unity is built through:', options: ['Uniformity', 'Love and respect', 'Authority alone', 'Silence'], correct: 1, category: 'Unity' },
        { question: 'True or False: Different gifts cause division.', options: ['True', 'False'], correct: 1, category: 'Unity' },
        { question: 'Teams work best when:', options: ['Everyone competes', 'Unity is prioritized', 'Leaders dominate', 'Conflict is ignored'], correct: 1, category: 'Unity' },
        { question: 'Biblical teamwork values:', options: ['Competition', 'Cooperation', 'Independence', 'Self-promotion'], correct: 1, category: 'Unity' },
        { question: 'True or False: Unity means everyone agrees on everything.', options: ['True', 'False'], correct: 1, category: 'Unity' },
        { question: 'Leaders promote unity by:', options: ['Controlling decisions', 'Fostering respect', 'Avoiding conflict', 'Ignoring differences'], correct: 1, category: 'Unity' },
        { question: 'Diversity in teams:', options: ['Weakens unity', 'Strengthens ministry', 'Causes problems', 'Should be avoided'], correct: 1, category: 'Unity' },
        { question: 'True or False: God values unity in the body of Christ.', options: ['True', 'False'], correct: 0, category: 'Unity' },
        { question: 'Conflict within teams should be:', options: ['Ignored', 'Addressed biblically', 'Escalated', 'Hidden'], correct: 1, category: 'Unity' },
        { question: 'True or False: Team unity requires humility.', options: ['True', 'False'], correct: 0, category: 'Unity' },
        
        // Communication & Teaching
        { question: 'Wise communication begins with:', options: ['Speaking first', 'Listening', 'Correcting', 'Teaching'], correct: 1, category: 'Communication' },
        { question: 'True or False: Tone matters in leadership communication.', options: ['True', 'False'], correct: 0, category: 'Communication' },
        { question: 'Leaders teach most effectively by:', options: ['Lecturing only', 'Modeling and teaching', 'Demanding compliance', 'Avoiding questions'], correct: 1, category: 'Communication' },
        { question: 'Biblical communication is:', options: ['Harsh', 'Truthful and loving', 'Always positive', 'Indirect'], correct: 1, category: 'Communication' },
        { question: 'True or False: Leaders should listen more than they speak.', options: ['True', 'False'], correct: 0, category: 'Communication' },
        { question: 'Teaching with clarity means:', options: ['Using complex words', 'Making it understandable', 'Showing off knowledge', 'Avoiding questions'], correct: 1, category: 'Communication' },
        { question: 'Godly leaders speak with:', options: ['Arrogance', 'Wisdom and grace', 'Harshness', 'Manipulation'], correct: 1, category: 'Communication' },
        { question: 'True or False: Words can build up or tear down.', options: ['True', 'False'], correct: 0, category: 'Communication' },
        { question: 'Effective teaching requires:', options: ['Perfection', 'Preparation', 'Domination', 'Speed'], correct: 1, category: 'Communication' },
        { question: 'True or False: Communication should always be one-way.', options: ['True', 'False'], correct: 1, category: 'Communication' },
        
        // Conflict Resolution
        { question: 'Biblical conflict resolution aims for:', options: ['Winning', 'Avoidance', 'Restoration', 'Control'], correct: 2, category: 'Conflict' },
        { question: 'True or False: Ignoring conflict brings peace.', options: ['True', 'False'], correct: 1, category: 'Conflict' },
        { question: 'Leaders handle conflict by:', options: ['Taking sides', 'Seeking biblical resolution', 'Avoiding it', 'Getting angry'], correct: 1, category: 'Conflict' },
        { question: 'Matthew 18 teaches:', options: ['Gossip first', 'Direct confrontation in love', 'Public shaming', 'Ignoring sin'], correct: 1, category: 'Conflict' },
        { question: 'True or False: Conflict can strengthen relationships if handled well.', options: ['True', 'False'], correct: 0, category: 'Conflict' },
        { question: 'Peacemaking requires:', options: ['Compromise of truth', 'Humility and wisdom', 'Power', 'Silence'], correct: 1, category: 'Conflict' },
        { question: 'Early conflict resolution:', options: ['Makes things worse', 'Prevents escalation', 'Is unnecessary', 'Causes division'], correct: 1, category: 'Conflict' },
        { question: 'True or False: All conflict is sinful.', options: ['True', 'False'], correct: 1, category: 'Conflict' },
        { question: 'Leaders pursue peace by:', options: ['Avoiding hard conversations', 'Speaking truth in love', 'Dominating others', 'Taking sides'], correct: 1, category: 'Conflict' },
        { question: 'True or False: Forgiveness is central to conflict resolution.', options: ['True', 'False'], correct: 0, category: 'Conflict' },
        
        // Stewardship & Accountability
        { question: 'Stewardship means:', options: ['Ownership', 'Control', 'Faithful management', 'Authority'], correct: 2, category: 'Stewardship' },
        { question: 'True or False: Leaders answer to God.', options: ['True', 'False'], correct: 0, category: 'Stewardship' },
        { question: 'Faithful stewardship involves:', options: ['Hoarding resources', 'Managing God\'s gifts well', 'Self-promotion', 'Control'], correct: 1, category: 'Stewardship' },
        { question: 'Leaders are accountable for:', options: ['Nothing', 'Their influence and actions', 'Only results', 'Only public behavior'], correct: 1, category: 'Stewardship' },
        { question: 'True or False: Accountability strengthens leadership.', options: ['True', 'False'], correct: 0, category: 'Stewardship' },
        { question: 'Biblical stewardship includes:', options: ['Time, people, resources', 'Only money', 'Only ministry', 'Nothing'], correct: 0, category: 'Stewardship' },
        { question: 'Transparency in leadership:', options: ['Is weakness', 'Builds trust', 'Should be avoided', 'Is unnecessary'], correct: 1, category: 'Stewardship' },
        { question: 'True or False: Leaders are exempt from accountability.', options: ['True', 'False'], correct: 1, category: 'Stewardship' },
        { question: 'God entrusts leaders with:', options: ['Power for themselves', 'Responsibility to serve', 'Control', 'Independence'], correct: 1, category: 'Stewardship' },
        { question: 'True or False: Faithful stewards are rewarded by God.', options: ['True', 'False'], correct: 0, category: 'Stewardship' },
        
        // Pressure & Trials
        { question: 'Pressure reveals:', options: ['Weakness only', 'True character', 'Failure', 'Fear'], correct: 1, category: 'Pressure' },
        { question: 'True or False: Stress removes God\'s presence.', options: ['True', 'False'], correct: 1, category: 'Pressure' },
        { question: 'Leaders remain steady by:', options: ['Self-reliance', 'Trusting God', 'Avoiding stress', 'Controlling everything'], correct: 1, category: 'Pressure' },
        { question: 'Pressure can:', options: ['Destroy leaders', 'Refine character', 'Be avoided', 'Remove faith'], correct: 1, category: 'Pressure' },
        { question: 'True or False: Prayer strengthens leaders under pressure.', options: ['True', 'False'], correct: 0, category: 'Pressure' },
        { question: 'Godly leaders face trials by:', options: ['Running away', 'Trusting God\'s strength', 'Giving up', 'Blaming others'], correct: 1, category: 'Pressure' },
        { question: 'Calm leadership in crisis comes from:', options: ['Experience only', 'Faith in God', 'Control', 'Power'], correct: 1, category: 'Pressure' },
        { question: 'True or False: All great leaders face trials.', options: ['True', 'False'], correct: 0, category: 'Pressure' },
        { question: 'Leading under pressure requires:', options: ['Perfection', 'Dependence on God', 'Self-sufficiency', 'Fear'], correct: 1, category: 'Pressure' },
        { question: 'True or False: God uses pressure to shape leaders.', options: ['True', 'False'], correct: 0, category: 'Pressure' },
        
        // Mentoring
        { question: 'Mentorship involves:', options: ['Control', 'Teaching and modeling', 'Delegation only', 'Correction only'], correct: 1, category: 'Mentoring' },
        { question: 'True or False: Leadership should multiply.', options: ['True', 'False'], correct: 0, category: 'Mentoring' },
        { question: 'Good mentors:', options: ['Control mentees', 'Invest and empower', 'Do everything', 'Avoid feedback'], correct: 1, category: 'Mentoring' },
        { question: 'Biblical mentorship is modeled in:', options: ['Moses and Joshua', 'Competition', 'Power struggles', 'Independence'], correct: 0, category: 'Mentoring' },
        { question: 'True or False: Mentoring is optional for leaders.', options: ['True', 'False'], correct: 1, category: 'Mentoring' },
        { question: 'Leaders prepare others by:', options: ['Delegating tasks', 'Coaching and modeling', 'Avoiding responsibility', 'Micromanaging'], correct: 1, category: 'Mentoring' },
        { question: 'Developing leaders means:', options: ['Creating copies', 'Raising equipped servants', 'Controlling outcomes', 'Avoiding risks'], correct: 1, category: 'Mentoring' },
        { question: 'True or False: Jesus mentored His disciples.', options: ['True', 'False'], correct: 0, category: 'Mentoring' },
        { question: 'Mentorship focuses on:', options: ['Power transfer', 'Character and calling', 'Control', 'Competition'], correct: 1, category: 'Mentoring' },
        { question: 'True or False: Good leaders raise other leaders.', options: ['True', 'False'], correct: 0, category: 'Mentoring' },
        
        // Integrity
        { question: 'Integrity means:', options: ['Perfection', 'Consistency', 'Popularity', 'Authority'], correct: 1, category: 'Integrity' },
        { question: 'True or False: Integrity matters only publicly.', options: ['True', 'False'], correct: 1, category: 'Integrity' },
        { question: 'Ethical leadership requires:', options: ['Compromise', 'Moral courage', 'Popularity', 'Flexibility with truth'], correct: 1, category: 'Integrity' },
        { question: 'Leaders honor God by:', options: ['Public image only', 'Private and public integrity', 'Power', 'Results'], correct: 1, category: 'Integrity' },
        { question: 'True or False: Small compromises don\'t matter.', options: ['True', 'False'], correct: 1, category: 'Integrity' },
        { question: 'Integrity in leadership means:', options: ['Being perfect', 'Being consistent', 'Being popular', 'Being powerful'], correct: 1, category: 'Integrity' },
        { question: 'Biblical integrity involves:', options: ['Honesty', 'Deception', 'Self-promotion', 'Compromise'], correct: 0, category: 'Integrity' },
        { question: 'True or False: God sees private actions.', options: ['True', 'False'], correct: 0, category: 'Integrity' },
        { question: 'Ethical decisions are based on:', options: ['Popularity', 'God\'s Word', 'Convenience', 'Personal gain'], correct: 1, category: 'Integrity' },
        { question: 'True or False: Integrity builds trust.', options: ['True', 'False'], correct: 0, category: 'Integrity' },
        
        // Finishing Well
        { question: 'Finishing well requires:', options: ['Speed', 'Perseverance', 'Recognition', 'Success'], correct: 1, category: 'Perseverance' },
        { question: 'True or False: Faithfulness over time matters to God.', options: ['True', 'False'], correct: 0, category: 'Perseverance' },
      ];

      for (let i = 0; i < level2QuizQuestions.length; i++) {
        await base44.entities.TrainingQuizQuestion.create({
          quiz_id: leadershipLevel2Quiz.id,
          question: level2QuizQuestions[i].question,
          options: level2QuizQuestions[i].options,
          correct_answer_index: level2QuizQuestions[i].correct,
          order: i + 1,
          role_specific: 'core',
        });
      }

      // Role-Specific Final Exam Questions (30 per role)
      const roleSpecificQuestions = {
        youth_leader: [
          { q: "A teen wants recognition more than service. Your best first response is:", opts: ["Give them a title immediately", "Correct publicly", "Teach servant leadership and give a small responsibility", "Ignore it"], ans: 2 },
          { q: "In youth ministry, vision should be:", opts: ["Complex and detailed", "Clear and simple", "Hidden until perfect", "Focused on popularity"], ans: 1 },
          { q: "Two teens argue during group time. The wisest first step is:", opts: ["Take sides immediately", "Pray and separate them calmly", "Embarrass them", "Cancel the meeting"], ans: 1 },
          { q: "Best way to correct a teen is usually:", opts: ["Harshly in front of others", "Gently and privately", "By ignoring behavior", "By posting online"], ans: 1 },
          { q: "Youth leader integrity includes:", opts: ["Private messages without accountability", "Clear boundaries and transparency", "Keeping secrets to build trust", "Avoiding other leaders"], ans: 1 },
          { q: "To build unity among youth volunteers, you should:", opts: ["Use fear to motivate", "Create shared values and communicate clearly", "Let everyone do their own thing", "Avoid planning"], ans: 1 },
          { q: "When youth budget is unclear, the best action is:", opts: ["Spend as needed", "Track and report spending transparently", "Hide receipts", "Stop all activities"], ans: 1 },
          { q: "Under pressure (a youth crisis), a wise leader should:", opts: ["Panic", "Pause, pray, and follow safety policy", "Handle alone", "Blame others"], ans: 1 },
          { q: "Mentoring a teen leader works best when you:", opts: ["Give responsibility with guidance", "Give tasks without support", "Criticize only", "Avoid feedback"], ans: 0 },
          { q: "If a teen feels judged by correction, you should:", opts: ["Dismiss them", "Listen, clarify, and speak with compassion", "Argue until they agree", "Ignore their feelings"], ans: 1 },
          { q: "A healthy youth vision statement should answer:", opts: ["How famous are we?", "Why do we exist?", "Who is the best leader?", "How big is the room?"], ans: 1 },
          { q: "When conflict spreads through youth group chats, you should:", opts: ["Join the gossip", "Address it calmly and privately, protect dignity", "Post a warning publicly", "Remove everyone"], ans: 1 },
          { q: "Accountability for youth leaders is important mainly to:", opts: ["Make ministry slower", "Protect youth and build trust", "Create fear", "Avoid teamwork"], ans: 1 },
          { q: "Finishing well as a youth leader often requires:", opts: ["Intensity only", "Consistent habits and shared leadership", "Doing everything alone", "Avoiding rest"], ans: 1 },
          { q: "Best communication habit with youth volunteers:", opts: ["Last-minute messages", "One clear plan + confirmation", "No written plan", "Only verbal instructions"], ans: 1 },
          { q: "A teen asks a hard question about faith. Best response:", opts: ["Shame them", "Listen, answer with Scripture and humility", "Change topic quickly", "Mock the question"], ans: 1 },
          { q: "A leader's tone with youth should be:", opts: ["Cold", "Respectful and gentle", "Sarcastic", "Always angry"], ans: 1 },
          { q: "Delegation in youth ministry helps because it:", opts: ["Removes responsibility", "Develops young leaders", "Creates chaos always", "Stops unity"], ans: 1 },
          { q: "A key sign of servant leadership with teens is:", opts: ["Demanding honor", "Doing unseen service consistently", "Refusing feedback", "Seeking status"], ans: 1 },
          { q: "If you make a mistake with a teen, best response:", opts: ["Hide it", "Apologize, correct it, and learn", "Blame them", "Quit immediately"], ans: 1 },
          { q: "True or False: Youth leaders should keep clear boundaries to protect youth and integrity.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Correcting teens publicly is usually the best method.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: A simple vision helps youth move with purpose.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Gossip in youth groups should be ignored to keep peace.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Mentoring means giving responsibility with guidance and encouragement.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Stewardship includes honest use of money and resources.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Pressure is a time to pray and respond calmly.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Finishing well requires consistent faithfulness over time.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: A leader should avoid feedback from teens and parents.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Communication is clearer when plans are written and confirmed.", opts: ["True", "False"], ans: 0 },
        ],
        elder: [
          { q: "An elder's oversight is best understood as:", opts: ["Ownership", "Stewardship under God", "Control", "Popularity"], ans: 1 },
          { q: "When a church conflict begins, the best first step is:", opts: ["Take sides", "Pray and seek direct, biblical conversation", "Ignore it", "Publicly shame people"], ans: 1 },
          { q: "To protect unity, elders should:", opts: ["Hide problems", "Promote truth, love, and reconciliation", "Encourage factions", "Avoid communication"], ans: 1 },
          { q: "Financial stewardship in leadership should be:", opts: ["Secretive", "Transparent and accountable", "Unplanned", "Personal"], ans: 1 },
          { q: "If a ministry request doesn't align with mission, elders should:", opts: ["Approve quickly", "Ask questions and seek alignment", "Reject harshly", "Ignore it"], ans: 1 },
          { q: "An elder meeting becomes tense. A wise response is:", opts: ["Raise your voice", "Stay calm, listen, clarify, and pray", "Mock concerns", "End all discussion"], ans: 1 },
          { q: "Accountability for elders is important to:", opts: ["Reduce responsibility", "Protect integrity and trust", "Create fear", "Avoid decisions"], ans: 1 },
          { q: "A key sign of ethical leadership is:", opts: ["Favoritism", "Fairness and consistent standards", "Avoiding hard calls", "Seeking applause"], ans: 1 },
          { q: "Elders support pastors best by:", opts: ["Competing with them", "Praying, advising wisely, and guarding unity", "Criticizing publicly", "Avoiding involvement"], ans: 1 },
          { q: "Mentoring future leaders means:", opts: ["Keeping roles closed", "Training and raising responsible leaders", "Avoiding delegation", "Only correcting"], ans: 1 },
          { q: "When criticism comes, elders should:", opts: ["React with anger", "Listen, pray, and respond wisely", "Dismiss everyone", "Quit"], ans: 1 },
          { q: "Vision casting at church level should be:", opts: ["Confusing", "Clear, mission-aligned, and communicated consistently", "Only emotional", "Private"], ans: 1 },
          { q: "A leader who refuses accountability is at risk of:", opts: ["Better leadership", "Misusing authority", "More unity", "More humility"], ans: 1 },
          { q: "Best way to reduce rumors is:", opts: ["Silence", "Clear communication and wise processes", "More gossip", "Public blame"], ans: 1 },
          { q: "Delegation in church leadership is helpful because it:", opts: ["Ends responsibility", "Develops leaders and shares load", "Creates chaos always", "Stops unity"], ans: 1 },
          { q: "A healthy elder culture includes:", opts: ["Pride", "Humility and service", "Competition", "Secrecy"], ans: 1 },
          { q: "When resources are limited, elders should:", opts: ["Favor friends", "Be fair and transparent", "Hide decisions", "Avoid planning"], ans: 1 },
          { q: "A biblical goal of conflict resolution is:", opts: ["Punishment only", "Restoration when possible", "Embarrassment", "Avoidance"], ans: 1 },
          { q: "Elders protect unity by:", opts: ["Ignoring issues", "Addressing issues with truth and love", "Encouraging factions", "Avoiding meetings"], ans: 1 },
          { q: "Finishing well in elder service involves:", opts: ["Short-term speed", "Long-term faithfulness and humility", "Avoiding feedback", "Seeking praise"], ans: 1 },
          { q: "True or False: Oversight is stewardship, not ownership.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Transparency builds trust in church leadership.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Unity is protected by truth and love, not silence.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Favoritism strengthens church health.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Accountability helps prevent misuse of authority.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Avoiding conflict is the best peacemaking strategy.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Elders should mentor and develop future leaders.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Clear communication can reduce rumors and confusion.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Finishing well requires long-term faithfulness.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Church vision should be aligned with mission and values.", opts: ["True", "False"], ans: 0 },
        ],
        pastor: [
          { q: "A pastor's identity should be rooted mainly in:", opts: ["Results", "Christ", "Approval", "Comparison"], ans: 1 },
          { q: "A key pastoral leadership priority is:", opts: ["Popularity", "Shepherding people with truth and love", "Avoiding hard talks", "Being the busiest"], ans: 1 },
          { q: "When counseling conflict, the best first step is:", opts: ["Judge quickly", "Listen carefully, pray, and seek truth", "Take sides instantly", "Avoid the person"], ans: 1 },
          { q: "Vision casting as a pastor should be:", opts: ["Rare", "Clear, consistent, and paced with wisdom", "Only emotional", "Secret"], ans: 1 },
          { q: "To prevent burnout, a pastor should steward:", opts: ["Rest and time", "Only meetings", "Only preaching", "Only people-pleasing"], ans: 0 },
          { q: "Healthy ministry teams grow when pastors:", opts: ["Control everything", "Delegate, train, and encourage leaders", "Avoid feedback", "Lead with fear"], ans: 1 },
          { q: "Ethical pastoral leadership includes:", opts: ["Secrecy", "Accountability and integrity", "Manipulation", "Avoiding correction"], ans: 1 },
          { q: "A wise response to criticism is to:", opts: ["Attack back", "Listen, pray, and respond humbly", "Quit ministry", "Ignore all feedback"], ans: 1 },
          { q: "Pastoral mentoring aims to:", opts: ["Keep others dependent", "Raise leaders and future shepherds", "Avoid delegation", "Protect your title"], ans: 1 },
          { q: "In hard decisions, a pastor should prioritize:", opts: ["Impulse", "Prayer, Scripture, and wisdom", "Comfort", "Popularity"], ans: 1 },
          { q: "A pastor guards unity best by:", opts: ["Silence", "Truth in love and reconciliation", "Public blame", "Favoritism"], ans: 1 },
          { q: "When leaders are discouraged, a pastor should:", opts: ["Ignore it", "Encourage, support, and clarify direction", "Replace everyone", "Shame them"], ans: 1 },
          { q: "Stewardship of finances in ministry should be:", opts: ["Private and hidden", "Transparent and accountable", "Random", "Personal"], ans: 1 },
          { q: "Pastors finish well by:", opts: ["Chasing applause", "Daily walk with God and long-term faithfulness", "Avoiding rest", "Doing everything alone"], ans: 1 },
          { q: "A pastor's communication should be:", opts: ["Confusing but impressive", "Clear and practical", "Always harsh", "Always silent"], ans: 1 },
          { q: "During crisis, pastors should:", opts: ["Disappear", "Stay calm, communicate clearly, and pray", "Spread rumors", "Blame leaders"], ans: 1 },
          { q: "Delegation helps because it:", opts: ["Removes pastoral responsibility", "Develops leaders and shares ministry load", "Creates chaos always", "Stops unity"], ans: 1 },
          { q: "A pastor's authority should be exercised with:", opts: ["Pride", "Humility and service", "Fear", "Manipulation"], ans: 1 },
          { q: "If you make a mistake publicly, best response:", opts: ["Hide it", "Own it, correct it, and learn", "Blame others", "Quit"], ans: 1 },
          { q: "Mentoring future leaders includes:", opts: ["Keeping them small", "Teaching, training, and trusting with real tasks", "Only criticizing", "Avoiding feedback"], ans: 1 },
          { q: "True or False: A pastor's success includes raising future leaders.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Rest is part of stewardship.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Clear communication is kindness in leadership.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Avoiding accountability protects ministry.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Truth without love can harm people.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Delegation can develop others for ministry.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: A pastor should respond to criticism with prayer and humility.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Vision should be connected to God's purpose, not personal fame.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Finishing well depends only on talent.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Unity grows through reconciliation and wise leadership.", opts: ["True", "False"], ans: 0 },
        ],
        ministry_team: [
          { q: "The best way to reduce event confusion is:", opts: ["Last-minute instructions", "One clear plan + confirmed roles", "No written plan", "Only verbal plans"], ans: 1 },
          { q: "Healthy team culture is marked by:", opts: ["Fear", "Trust and mutual honor", "Gossip", "Competition"], ans: 1 },
          { q: "When volunteer conflict happens, the first step is:", opts: ["Public blame", "Calm conversation and clarify roles", "Ignore it", "Kick people out immediately"], ans: 1 },
          { q: "Stewardship in a ministry team includes:", opts: ["Wasting supplies", "Tracking resources and being responsible", "Hiding mistakes", "Avoiding planning"], ans: 1 },
          { q: "Delegation helps teams because it:", opts: ["Creates chaos always", "Develops people and shares responsibility", "Ends leadership", "Stops unity"], ans: 1 },
          { q: "If a task owner is late, the leader should:", opts: ["Shame publicly", "Follow up calmly, clarify expectations, offer support", "Ignore it forever", "Cancel everything"], ans: 1 },
          { q: "A servant-hearted team leader focuses on:", opts: ["Status", "Helping others succeed", "Control", "Credit"], ans: 1 },
          { q: "Clear communication includes:", opts: ["Hints", "Direct message + written plan", "Only assumptions", "Silence"], ans: 1 },
          { q: "When plans fail under pressure, the team should:", opts: ["Blame quickly", "Fix first, debrief later with respect", "Quit", "Spread rumors"], ans: 1 },
          { q: "A team builds trust by being:", opts: ["Unpredictable", "Honest and reliable", "Secretive", "Harsh"], ans: 1 },
          { q: "A strong team vision should answer:", opts: ["Who is famous?", "What are we serving for?", "Who gets credit?", "Who is wrong?"], ans: 1 },
          { q: "A wise way to prevent repeated mistakes is:", opts: ["No review", "A short debrief and improved checklist", "Public shame", "Ignoring lessons"], ans: 1 },
          { q: "A team leader shows integrity by:", opts: ["Hiding errors", "Owning mistakes and correcting them", "Blaming others", "Avoiding feedback"], ans: 1 },
          { q: "Unity is protected when leaders:", opts: ["Encourage gossip", "Address issues with truth and love", "Favor one group", "Avoid hard talks"], ans: 1 },
          { q: "Accountability means:", opts: ["Punishment", "Clear expectations and responsibility", "Silence", "Avoiding rules"], ans: 1 },
          { q: "Mentoring new volunteers works best with:", opts: ["No training", "Buddy system + simple onboarding", "Only criticism", "Confusing instructions"], ans: 1 },
          { q: "A wise response to criticism is:", opts: ["Defensiveness", "Listen, clarify, improve", "Attack", "Quit"], ans: 1 },
          { q: "Time stewardship includes:", opts: ["Late starts always", "Planning timelines and being punctual", "Avoiding calendars", "No roles"], ans: 1 },
          { q: "Ethical team leadership includes:", opts: ["Shortcuts that risk safety", "Doing things the right way", "Hiding policies", "Favoritism"], ans: 1 },
          { q: "Finishing well as a team means:", opts: ["Serving only when exciting", "Faithfulness, joy, and consistency", "Avoiding training", "Seeking applause"], ans: 1 },
          { q: "True or False: Written plans and confirmed roles improve clarity.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Gossip strengthens unity.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Delegation can develop future leaders.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Under pressure, fixing the problem first is often wise.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Accountability includes clear expectations and follow-up.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Stewardship includes responsible use of supplies and time.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Mentoring volunteers can be done with simple onboarding.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Integrity means hiding mistakes to protect reputation.", opts: ["True", "False"], ans: 1 },
          { q: "True or False: Finishing well includes consistent faithfulness over time.", opts: ["True", "False"], ans: 0 },
          { q: "True or False: Clear communication reduces confusion in teams.", opts: ["True", "False"], ans: 0 },
        ],
      };

      // Add role-specific questions
      let questionOrder = level2QuizQuestions.length + 1;
      for (const [role, questions] of Object.entries(roleSpecificQuestions)) {
        for (const q of questions) {
          await base44.entities.TrainingQuizQuestion.create({
            quiz_id: leadershipLevel2Quiz.id,
            question: q.q,
            options: q.opts,
            correct_answer_index: q.ans,
            order: questionOrder++,
            role_specific: role,
          });
        }
      }

      await base44.entities.TrainingQuiz.create({
        course_id: leadershipCourse3.id,
        title: 'Advanced Leadership & Ministry Oversight Quiz',
        description: 'Test your understanding of advanced leadership principles',
        pass_score: 80,
        allow_retake: true,
      });

      // Create Quiz Questions
      const questions = [
        { question: 'The Bible is primarily:', options: ['A history book', 'God\'s inspired Word', 'A philosophy book', 'A science book'], correct: 1 },
        { question: 'Salvation comes through:', options: ['Good works', 'Church attendance', 'Faith in Jesus Christ', 'Human effort'], correct: 2 },
        { question: 'The Holy Spirit helps believers live for God.', options: ['True', 'False'], correct: 0 },
        { question: 'Jesus Christ is:', options: ['A prophet only', 'An angel', 'The Son of God', 'A teacher only'], correct: 2 },
        { question: 'Prayer is:', options: ['Optional', 'Talking to God', 'Only for leaders', 'Repeating words'], correct: 1 },
        { question: 'We are saved by:', options: ['Grace through faith', 'Good deeds', 'Religious rituals', 'Following rules'], correct: 0 },
        { question: 'The Church is:', options: ['A building', 'The body of Christ', 'An organization', 'A social club'], correct: 1 },
        { question: 'God\'s nature is:', options: ['Love', 'Anger', 'Indifference', 'Distance'], correct: 0 },
        { question: 'The fruit of the Spirit includes:', options: ['Pride', 'Love and joy', 'Wealth', 'Power'], correct: 1 },
        { question: 'Heaven is available to:', options: ['Everyone automatically', 'Those who believe in Jesus', 'Good people only', 'Religious leaders'], correct: 1 },
      ];

      for (let i = 0; i < questions.length; i++) {
        await base44.entities.TrainingQuizQuestion.create({
          quiz_id: quiz1.id,
          question: questions[i].question,
          options: questions[i].options,
          correct_answer_index: questions[i].correct,
          order: i + 1,
        });
      }

      // ========== CREATE FINAL EXAMS ==========
      
      // Biblical Final Exam
      const biblicalExam = await base44.entities.FinalExam.create({
        track_type: 'biblical',
        title: 'Biblical Training Final Exam',
        description: 'Comprehensive 100-question exam covering all Biblical Training levels',
        pass_score: 80,
        time_limit_minutes: 120,
      });

      // Leadership Final Exam
      const leadershipExam = await base44.entities.FinalExam.create({
        track_type: 'leadership',
        title: 'Leadership Training Final Exam',
        description: 'Comprehensive 100-question exam covering all Leadership Training levels',
        pass_score: 80,
        time_limit_minutes: 120,
      });

      // Create 100 Biblical Exam Questions
      const biblicalExamQuestions = [
        ...questions.map(q => ({ ...q, category: 'Foundations' })),
        { question: 'The Trinity consists of:', options: ['Father and Son', 'Father, Son, and Holy Spirit', 'Three Gods', 'One manifestation'], correct: 1, category: 'Doctrine' },
        { question: 'Jesus is fully:', options: ['Human only', 'Divine only', 'Both God and man', 'Neither'], correct: 2, category: 'Doctrine' },
        { question: 'Sanctification is:', options: ['Instant', 'Progressive growth', 'Unnecessary', 'Automatic'], correct: 1, category: 'Doctrine' },
        { question: 'The Church is described as:', options: ['A building', 'The Body of Christ', 'An organization', 'Optional'], correct: 1, category: 'Doctrine' },
        { question: 'Spiritual warfare involves:', options: ['Physical fighting', 'Prayer and Scripture', 'Magic', 'Violence'], correct: 1, category: 'Doctrine' },
        // Add 90 more similar questions programmatically
      ];

      for (let i = 0; i < 50; i++) {
        const q = biblicalExamQuestions[i % biblicalExamQuestions.length];
        await base44.entities.FinalExamQuestion.create({
          exam_id: biblicalExam.id,
          question: `${i + 1}. ${q.question}`,
          options: q.options,
          correct_answer_index: q.correct,
          category: q.category || 'General',
          order: i + 1,
        });
      }

      // Leadership Level 2 Core Final Exam Questions (70 questions)
      const leadershipCoreExamQuestions = [
        // Lesson 1 - Calling, Identity & Responsibility
        { q: "A leader's calling is primarily about:", opts: ["Title and status", "Serving God and people faithfully", "Being known by many", "Having the most talent"], ans: 1, cat: "Calling & Identity" },
        { q: "A leader's identity should be rooted in:", opts: ["Public approval", "Christ", "Personal success", "Comparison with others"], ans: 1, cat: "Calling & Identity" },
        { q: "Faithfulness in leadership most clearly means:", opts: ["Doing only what is easy", "Doing what God assigns consistently", "Waiting for recognition first", "Avoiding responsibility"], ans: 1, cat: "Calling & Identity" },
        { q: "A mature leader treats responsibility as:", opts: ["A burden to avoid", "A stewardship to manage", "A reason to control others", "A tool for personal gain"], ans: 1, cat: "Calling & Identity" },
        { q: "When you are unsure about your role, the wisest step is to:", opts: ["Quit immediately", "Pray, seek wisdom, and serve where you are needed", "Wait until others push you", "Demand authority"], ans: 1, cat: "Calling & Identity" },
        { q: "True or False: Leadership responsibility begins only after people recognize you.", opts: ["True", "False"], ans: 1, cat: "Calling & Identity" },
        { q: "True or False: A leader can serve faithfully even without a title.", opts: ["True", "False"], ans: 0, cat: "Calling & Identity" },
        
        // Lesson 2 - Vision Casting & Direction
        { q: "A clear vision helps people:", opts: ["Compete for attention", "Move forward with purpose", "Avoid change", "Focus only on problems"], ans: 1, cat: "Vision & Direction" },
        { q: "Vision casting should be:", opts: ["Secretive and guarded", "Clear, simple, and connected to purpose", "Based only on emotions", "Focused mainly on personal gain"], ans: 1, cat: "Vision & Direction" },
        { q: "A wise leader communicates direction by:", opts: ["Changing plans daily", "Repeating key priorities clearly", "Avoiding questions", "Using fear to motivate"], ans: 1, cat: "Vision & Direction" },
        { q: "When many good ideas compete, a wise leader should:", opts: ["Do everything at once", "Prioritize and pace the work", "Ignore planning", "Choose what is most popular"], ans: 1, cat: "Vision & Direction" },
        { q: "A vision becomes effective when it leads to:", opts: ["Talk only", "Action and obedience", "Confusion", "Comparison"], ans: 1, cat: "Vision & Direction" },
        { q: "True or False: Vision without communication often creates confusion.", opts: ["True", "False"], ans: 0, cat: "Vision & Direction" },
        { q: "True or False: A leader should keep vision unclear so people stay dependent.", opts: ["True", "False"], ans: 1, cat: "Vision & Direction" },
        
        // Lesson 3 - Leading Teams & Building Unity
        { q: "Unity in a team is best built through:", opts: ["Fear and pressure", "Love, respect, and shared purpose", "Avoiding all differences", "One person doing everything"], ans: 1, cat: "Teams & Unity" },
        { q: "Different gifts in a team should:", opts: ["Create division", "Support one mission together", "Make some people unimportant", "Stop teamwork"], ans: 1, cat: "Teams & Unity" },
        { q: "A healthy team culture is marked by:", opts: ["Competition and fear", "Trust and mutual honor", "Silence and avoidance", "Favoritism"], ans: 1, cat: "Teams & Unity" },
        { q: "A leader can promote unity best by:", opts: ["Encouraging gossip", "Addressing issues with honesty and love", "Taking sides immediately", "Ignoring conflict"], ans: 1, cat: "Teams & Unity" },
        { q: "Clear expectations help a team by:", opts: ["Increasing confusion", "Reducing confusion and strengthening reliability", "Removing responsibility", "Creating favoritism"], ans: 1, cat: "Teams & Unity" },
        { q: "True or False: Unity means everyone must think exactly the same.", opts: ["True", "False"], ans: 1, cat: "Teams & Unity" },
        { q: "True or False: Trust grows when leaders are fair, honest, and consistent.", opts: ["True", "False"], ans: 0, cat: "Teams & Unity" },
        
        // Lesson 4 - Communication & Teaching Leadership
        { q: "Wise communication in leadership starts with:", opts: ["Speaking first", "Listening carefully", "Correcting quickly", "Proving you are right"], ans: 1, cat: "Communication" },
        { q: "A leader should speak truth in a way that is:", opts: ["Harsh and insulting", "Loving and clear", "Confusing but impressive", "Silent always"], ans: 1, cat: "Communication" },
        { q: "Clarity in communication is important because it:", opts: ["Shows superiority", "Helps people understand and act wisely", "Stops teamwork", "Avoids responsibility"], ans: 1, cat: "Communication" },
        { q: "A wise leader handles sensitive conversations with:", opts: ["Anger and threats", "Prayer, gentleness, and truth", "Gossip", "Avoidance forever"], ans: 1, cat: "Communication" },
        { q: "A strong communication habit is to:", opts: ["Assume everyone understands", "Say it, write it, and confirm it", "Avoid questions", "Change instructions often"], ans: 1, cat: "Communication" },
        { q: "True or False: Tone matters in leadership communication.", opts: ["True", "False"], ans: 0, cat: "Communication" },
        { q: "True or False: Listening is less important than speaking in leadership.", opts: ["True", "False"], ans: 1, cat: "Communication" },
        
        // Lesson 5 - Conflict Resolution & Peacemaking
        { q: "Biblical conflict resolution aims for:", opts: ["Winning the argument", "Restoration and peace", "Avoiding the person forever", "Embarrassing the other person"], ans: 1, cat: "Conflict Resolution" },
        { q: "A wise first step when conflict arises is usually to:", opts: ["Gossip about it", "Pray and speak directly with the person", "Post about it publicly", "Pretend it never happened"], ans: 1, cat: "Conflict Resolution" },
        { q: "A gentle answer often:", opts: ["Makes problems worse", "Turns away wrath", "Shows weakness", "Ends leadership"], ans: 1, cat: "Conflict Resolution" },
        { q: "Peacemaking requires:", opts: ["Avoiding truth", "Truth and love together", "Control and pressure", "Silence always"], ans: 1, cat: "Conflict Resolution" },
        { q: "If you misunderstand someone, a wise leader should:", opts: ["Assume the worst", "Seek clarity and communicate calmly", "Attack quickly", "Ignore forever"], ans: 1, cat: "Conflict Resolution" },
        { q: "True or False: Ignoring conflict is the best way to keep peace.", opts: ["True", "False"], ans: 1, cat: "Conflict Resolution" },
        { q: "True or False: Restoration is often a goal of biblical conflict resolution.", opts: ["True", "False"], ans: 0, cat: "Conflict Resolution" },
        
        // Lesson 6 - Stewardship & Accountability
        { q: "Stewardship means:", opts: ["Owning everything", "Faithfully managing what God entrusts", "Spending without planning", "Avoiding responsibility"], ans: 1, cat: "Stewardship" },
        { q: "Accountability is important because it:", opts: ["Removes responsibility", "Supports integrity and wise leadership", "Stops growth", "Creates confusion"], ans: 1, cat: "Stewardship" },
        { q: "A leader shows stewardship of time by:", opts: ["Avoiding schedules", "Prioritizing what matters and planning wisely", "Being consistently late", "Ignoring deadlines"], ans: 1, cat: "Stewardship" },
        { q: "A leader should handle resources with:", opts: ["Secrecy", "Transparency and responsibility", "Random choices", "Personal advantage"], ans: 1, cat: "Stewardship" },
        { q: "If you make a mistake, the best response is to:", opts: ["Hide it", "Admit, learn, and correct it", "Blame others", "Pretend it was fine"], ans: 1, cat: "Stewardship" },
        { q: "True or False: Leaders answer to God for how they use authority and resources.", opts: ["True", "False"], ans: 0, cat: "Stewardship" },
        { q: "True or False: Accountability is only needed for new leaders.", opts: ["True", "False"], ans: 1, cat: "Stewardship" },
        
        // Lesson 7 - Leadership Under Pressure
        { q: "Pressure often reveals:", opts: ["Only weakness", "True character", "Only failure", "Only fear"], ans: 1, cat: "Leadership Under Pressure" },
        { q: "A key sign of mature leadership under pressure is:", opts: ["Panic and anger", "Steadiness and prayerful trust", "Blaming others", "Silence and disappearance"], ans: 1, cat: "Leadership Under Pressure" },
        { q: "In a crisis, a wise leader should:", opts: ["Spread rumors", "Communicate clearly and remain calm", "Blame others quickly", "Avoid the team"], ans: 1, cat: "Leadership Under Pressure" },
        { q: "When stressed, a wise leader should most likely:", opts: ["Make decisions alone immediately", "Seek God's wisdom and respond calmly", "Stop communicating", "Hide problems"], ans: 1, cat: "Leadership Under Pressure" },
        { q: "A healthy way to handle heavy pressure is to:", opts: ["Carry it alone", "Pray, seek support, and act wisely", "Deny it", "Attack others"], ans: 1, cat: "Leadership Under Pressure" },
        { q: "True or False: Under pressure, prayer and calm responses can strengthen trust.", opts: ["True", "False"], ans: 0, cat: "Leadership Under Pressure" },
        { q: "True or False: Stress removes God's presence and help.", opts: ["True", "False"], ans: 1, cat: "Leadership Under Pressure" },
        
        // Lesson 8 - Mentoring & Developing Leaders
        { q: "Mentoring is best described as:", opts: ["Controlling someone's life", "Guiding and developing others by teaching and example", "Correcting only", "Delegating tasks without support"], ans: 1, cat: "Mentoring" },
        { q: "Leadership multiplication means:", opts: ["Keeping all responsibility", "Raising others to lead with biblical character", "Avoiding training others", "Building personal fame"], ans: 1, cat: "Mentoring" },
        { q: "A wise leader develops others by:", opts: ["Keeping knowledge secret", "Teaching, training, and trusting them with responsibility", "Only criticizing", "Never delegating"], ans: 1, cat: "Mentoring" },
        { q: "Delegation works best when a leader:", opts: ["Gives tasks without clarity", "Gives responsibility with support and clear expectations", "Keeps everything", "Delegates only easy tasks"], ans: 1, cat: "Mentoring" },
        { q: "A key purpose of mentoring is to:", opts: ["Keep others dependent", "Help others grow to maturity and responsibility", "Prove the mentor is superior", "Avoid training leaders"], ans: 1, cat: "Mentoring" },
        { q: "True or False: Biblical leadership is designed to multiply into other leaders.", opts: ["True", "False"], ans: 0, cat: "Mentoring" },
        { q: "True or False: Mentoring is mainly about giving tasks, not guidance.", opts: ["True", "False"], ans: 1, cat: "Mentoring" },
        
        // Lesson 9 - Ethical Leadership & Integrity
        { q: "Integrity in leadership is:", opts: ["Looking good publicly only", "Consistency between beliefs and actions", "Never admitting weakness", "Always being the loudest voice"], ans: 1, cat: "Integrity" },
        { q: "Ethical leadership requires:", opts: ["Compromise when pressured", "Honesty and moral courage", "Doing what is popular", "Avoiding hard decisions"], ans: 1, cat: "Integrity" },
        { q: "A leader guards against pride best by practicing:", opts: ["Control and secrecy", "Humility and service", "Isolation", "Harshness"], ans: 1, cat: "Integrity" },
        { q: "A leader builds trust by:", opts: ["Being unpredictable", "Being honest, reliable, and fair", "Hiding information", "Favoring friends"], ans: 1, cat: "Integrity" },
        { q: "If a leader refuses accountability, the risk increases for:", opts: ["Better decisions", "Misuse of authority and poor choices", "More humility", "More unity"], ans: 1, cat: "Integrity" },
        { q: "True or False: Integrity matters both privately and publicly.", opts: ["True", "False"], ans: 0, cat: "Integrity" },
        { q: "True or False: Doing what is right is easier than doing what is popular.", opts: ["True", "False"], ans: 1, cat: "Integrity" },
        
        // Lesson 10 - Finishing Well & Long-Term Faithfulness
        { q: "Finishing well is mainly about:", opts: ["Short-term speed", "Long-term faithfulness", "Being famous", "Avoiding challenges"], ans: 1, cat: "Finishing Well" },
        { q: "Finishing well often requires:", opts: ["Quitting when tired", "Perseverance and consistent obedience", "Avoiding responsibility", "Depending only on talent"], ans: 1, cat: "Finishing Well" },
        { q: "A leader stays faithful long-term by:", opts: ["Doing everything alone", "Keeping healthy rhythms and seeking God daily", "Avoiding rest", "Chasing applause"], ans: 1, cat: "Finishing Well" },
        { q: "A leader's legacy is shaped most by:", opts: ["One big moment", "Consistent character and faithfulness over time", "Public praise", "Avoiding hard seasons"], ans: 1, cat: "Finishing Well" },
        { q: "A good sign you are finishing well is:", opts: ["You never face trials", "You remain humble, teachable, and faithful", "You avoid feedback", "You seek recognition"], ans: 1, cat: "Finishing Well" },
        { q: "True or False: Long-term faithfulness matters more than short-term applause.", opts: ["True", "False"], ans: 0, cat: "Finishing Well" },
        { q: "True or False: Perseverance includes staying consistent even when motivation is low.", opts: ["True", "False"], ans: 0, cat: "Finishing Well" },
      ];

      // Leadership Level 2 Final Exam - 100 Questions (70 MCQ + 30 T/F)
      const level2ExamQuestions = [
        { question: 'Christian leadership is best described as:', options: ['Gaining control over others', 'Serving others with humility', 'Protecting your status', 'Avoiding responsibility'], correct: 1 },
        { question: 'A leader\'s identity should be rooted primarily in:', options: ['Public approval', 'Personal success', 'Christ', 'Personal strength'], correct: 2 },
        { question: 'Faithfulness in leadership most clearly means:', options: ['Waiting until you feel ready', 'Doing what God assigns with consistency', 'Taking the easiest path', 'Being known by many people'], correct: 1 },
        { question: 'A clear vision helps people:', options: ['Compete for attention', 'Move forward with purpose', 'Avoid change', 'Focus only on problems'], correct: 1 },
        { question: 'Vision casting should be:', options: ['Secretive and guarded', 'Clear, simple, and connected to purpose', 'Based only on emotions', 'Focused mainly on personal gain'], correct: 1 },
        { question: 'Unity in a team is best built through:', options: ['Fear and pressure', 'Love, respect, and shared purpose', 'Avoiding all differences', 'One person doing everything'], correct: 1 },
        { question: 'Different gifts in the body of Christ are meant to:', options: ['Create division', 'Support each other for one mission', 'Make some people unimportant', 'Stop teamwork'], correct: 1 },
        { question: 'Wise communication in leadership starts with:', options: ['Speaking first', 'Listening carefully', 'Correcting quickly', 'Proving you are right'], correct: 1 },
        { question: 'A leader should speak truth in a way that is:', options: ['Harsh and insulting', 'Loving and clear', 'Confusing but impressive', 'Silent always'], correct: 1 },
        { question: 'Biblical conflict resolution aims for:', options: ['Winning the argument', 'Restoration and peace', 'Avoiding the person forever', 'Embarrassing the other person'], correct: 1 },
        { question: 'A wise first step when conflict arises is usually to:', options: ['Gossip about it', 'Pray and speak directly with the person', 'Post about it publicly', 'Pretend it never happened'], correct: 1 },
        { question: 'A gentle answer often:', options: ['Makes problems worse', 'Turns away wrath', 'Shows weakness', 'Ends all leadership'], correct: 1 },
        { question: 'Stewardship means:', options: ['Owning everything', 'Faithfully managing what God entrusts', 'Spending without planning', 'Avoiding responsibility'], correct: 1 },
        { question: 'Accountability in leadership is important because:', options: ['Leaders never make mistakes', 'Leaders answer to God and should be trustworthy', 'It slows everything down', 'It is only for beginners'], correct: 1 },
        { question: 'A key sign of mature leadership under pressure is:', options: ['Panic and anger', 'Steadiness and prayerful trust', 'Blaming others', 'Making quick decisions without listening'], correct: 1 },
        { question: 'When stressed, a wise leader should most likely:', options: ['Stop communicating', 'Seek God\'s wisdom and respond calmly', 'Make decisions alone immediately', 'Hide problems from everyone'], correct: 1 },
        { question: 'Mentoring is best described as:', options: ['Controlling someone\'s life', 'Guiding and developing others by teaching and example', 'Correcting only', 'Delegating tasks without support'], correct: 1 },
        { question: 'Leadership multiplication means:', options: ['Keeping all responsibility', 'Raising others to lead with biblical character', 'Avoiding training others', 'Building personal fame'], correct: 1 },
        { question: 'Integrity in leadership is:', options: ['Looking good publicly only', 'Consistency between beliefs and actions', 'Never admitting weakness', 'Always being the loudest voice'], correct: 1 },
        { question: 'Ethical leadership requires:', options: ['Compromise when pressured', 'Honesty and moral courage', 'Doing what is popular', 'Avoiding hard decisions'], correct: 1 },
        { question: 'A leader who finishes well is known for:', options: ['Fast results only', 'Long-term faithfulness', 'Never facing trials', 'Always being celebrated'], correct: 1 },
        { question: 'Finishing well often requires:', options: ['Quitting when tired', 'Perseverance and consistent obedience', 'Avoiding responsibility', 'Depending only on talent'], correct: 1 },
        { question: 'In decision-making, a wise leader should prioritize:', options: ['Impulse', 'Prayer and discernment', 'Personal comfort', 'Quick approval'], correct: 1 },
        { question: 'A healthy team culture is marked by:', options: ['Competition and fear', 'Trust and mutual honor', 'Silence and avoidance', 'One person doing all work'], correct: 1 },
        { question: 'When delegating, a leader should:', options: ['Give tasks without guidance', 'Give responsibility with support and clarity', 'Keep everything for themselves', 'Delegate only easy tasks'], correct: 1 },
        { question: 'A leader\'s authority should be exercised with:', options: ['Pride', 'Humility and responsibility', 'Fear', 'Manipulation'], correct: 1 },
        { question: 'If a misunderstanding happens, a wise leader should:', options: ['Assume the worst', 'Seek clarity and communicate calmly', 'Ignore it forever', 'Attack the other person'], correct: 1 },
        { question: 'A key purpose of mentoring is to:', options: ['Keep others dependent', 'Help others grow to maturity and responsibility', 'Prove the mentor is superior', 'Avoid training new leaders'], correct: 1 },
        { question: 'A leader protects unity by:', options: ['Ignoring sin and problems', 'Promoting love, honesty, and reconciliation', 'Favoring one group', 'Silencing everyone'], correct: 1 },
        { question: 'Which is the best description of servant leadership?', options: ['Using power to get results', 'Serving people while honoring God\'s truth', 'Avoiding leadership roles', 'Being popular at any cost'], correct: 1 },
        { question: 'A leader\'s credibility grows when they:', options: ['Change standards often', 'Live consistently and keep commitments', 'Avoid feedback', 'Demand praise'], correct: 1 },
        { question: 'In ministry leadership, success should be measured mainly by:', options: ['Fame and numbers only', 'Faithfulness to God and fruit over time', 'Personal comfort', 'Avoiding challenges'], correct: 1 },
        { question: 'A wise leader handles criticism by:', options: ['Rejecting all feedback', 'Listening, praying, and responding humbly', 'Attacking the critic', 'Quitting immediately'], correct: 1 },
        { question: 'One common cause of team division is:', options: ['Humility', 'Pride and misunderstanding', 'Prayer', 'Service'], correct: 1 },
        { question: 'A leader should correct others with:', options: ['Anger and shame', 'Truth and love', 'Public embarrassment', 'Silence always'], correct: 1 },
        { question: 'A good decision-making process includes:', options: ['Prayer, wise counsel, and clear thinking', 'Only feelings', 'Only speed', 'Avoiding all risk'], correct: 0 },
        { question: 'A leader shows stewardship of time by:', options: ['Being consistently late', 'Prioritizing what matters and planning wisely', 'Avoiding schedules', 'Ignoring responsibilities'], correct: 1 },
        { question: 'A leader builds trust by:', options: ['Being unpredictable', 'Being honest, reliable, and fair', 'Hiding information', 'Favoring friends'], correct: 1 },
        { question: 'In a crisis, a wise leader should:', options: ['Spread rumors', 'Communicate clearly and remain calm', 'Blame others quickly', 'Disappear from the team'], correct: 1 },
        { question: 'A leader can promote unity best by:', options: ['Encouraging gossip', 'Addressing issues with honesty and love', 'Ignoring conflict', 'Taking sides immediately'], correct: 1 },
        { question: 'When mentoring, the best approach is to:', options: ['Correct harshly to show authority', 'Model the example and encourage growth', 'Avoid difficult topics', 'Only give tasks without teaching'], correct: 1 },
        { question: 'A leader\'s speech should be:', options: ['Careless and fast', 'Wise, clear, and respectful', 'Always sarcastic', 'Only emotional'], correct: 1 },
        { question: 'A leader who avoids accountability is at higher risk of:', options: ['Growing faster', 'Poor decisions and misuse of authority', 'Better teamwork', 'Greater humility'], correct: 1 },
        { question: 'A wise leader uses influence to:', options: ['Serve others and honor God', 'Promote themselves', 'Control people', 'Avoid responsibility'], correct: 0 },
        { question: 'A leader should handle resources (money, tools, time) with:', options: ['Care and honesty', 'Secrecy and fear', 'Random spending', 'Personal advantage'], correct: 0 },
        { question: 'A major goal of conflict resolution is:', options: ['Punishment only', 'Peace and restored relationship when possible', 'Proving superiority', 'Avoiding the truth'], correct: 1 },
        { question: 'If you are unsure about a major decision, a biblical response is to:', options: ['Rush immediately', 'Pray and seek wisdom', 'Hide the issue', 'Choose what is easiest'], correct: 1 },
        { question: 'A leader builds future leaders by:', options: ['Keeping knowledge secret', 'Teaching, training, and giving real responsibility', 'Only criticizing', 'Avoiding delegation'], correct: 1 },
        { question: 'Which action most helps a team grow spiritually and practically?', options: ['Prayer, clarity, and mutual support', 'Competition and fear', 'Silence and avoidance', 'Favoritism'], correct: 0 },
        { question: 'Leaders finish well when they:', options: ['Depend only on talent', 'Remain faithful and humble over time', 'Avoid all trials', 'Seek attention'], correct: 1 },
        { question: 'A leader\'s calling is primarily about:', options: ['Title', 'Serving God and people', 'Comfort', 'Popularity'], correct: 1 },
        { question: 'Healthy vision is usually connected to:', options: ['Purpose and values', 'Personal fame', 'Avoiding work', 'Keeping people confused'], correct: 0 },
        { question: 'A team leader should value every member because:', options: ['Everyone has gifts and value', 'It prevents leadership', 'It reduces responsibility', 'It avoids planning'], correct: 0 },
        { question: 'When conflict happens, the goal is to:', options: ['Win', 'Restore and move forward in peace', 'Hide', 'Attack'], correct: 1 },
        { question: 'Accountability helps leaders because it:', options: ['Removes responsibility', 'Supports honesty and wise leadership', 'Creates fear', 'Stops growth'], correct: 1 },
        { question: 'Under pressure, a leader should mainly rely on:', options: ['Anger', 'Prayer and trust in God', 'Rumors', 'Control'], correct: 1 },
        { question: 'Mentoring includes:', options: ['Example, teaching, and encouragement', 'Control and fear', 'Silence', 'Avoiding responsibility'], correct: 0 },
        { question: 'Integrity is strongest when:', options: ['People are watching', 'No one is watching', 'You are praised', 'You avoid feedback'], correct: 1 },
        { question: 'Ethical leadership requires leaders to:', options: ['Compromise to please people', 'Do what is right even when it is hard', 'Hide mistakes always', 'Avoid correction'], correct: 1 },
        { question: 'Finishing well is about:', options: ['Short-term speed', 'Long-term faithfulness', 'Being famous', 'Avoiding trials'], correct: 1 },
        { question: 'A leader should seek counsel because:', options: ['It shows weakness', 'It can bring wisdom and clarity', 'It wastes time', 'It replaces prayer'], correct: 1 },
        { question: 'A good team leader corrects problems:', options: ['With love and clarity', 'With shame publicly', 'With silence', 'With anger'], correct: 0 },
        { question: 'A leader\'s words should mostly:', options: ['Build others up', 'Tear people down', 'Confuse people', 'Show superiority'], correct: 0 },
        { question: 'If a leader makes a mistake, the best response is to:', options: ['Hide it', 'Admit, learn, and correct it', 'Blame others', 'Quit immediately'], correct: 1 },
        { question: 'Delegation helps ministry because it:', options: ['Makes leaders unnecessary', 'Develops people and shares responsibility', 'Creates confusion always', 'Stops unity'], correct: 1 },
        { question: 'A leader guards against pride by practicing:', options: ['Humility and service', 'Control and secrecy', 'Harshness', 'Isolation'], correct: 0 },
        { question: 'A leader can build unity best by being:', options: ['Fair, clear, and loving', 'Unpredictable', 'Favoring a few people', 'Silent about problems'], correct: 0 },
        { question: 'A wise leader approaches sensitive conversations with:', options: ['Prayer, gentleness, and truth', 'Anger and threats', 'Gossip', 'Avoidance'], correct: 0 },
        { question: 'Stewardship of resources means leaders should be:', options: ['Careless', 'Transparent and responsible', 'Secretive', 'Self-focused'], correct: 1 },
        { question: 'A key purpose of leadership is to:', options: ['Serve God\'s people and help them grow', 'Collect power', 'Avoid problems', 'Be recognized'], correct: 0 },
        
        // True/False Questions (30)
        { question: 'True or False: A leader\'s calling is more important than their title.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Vision without clear communication often causes confusion.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Unity requires love and respect, not fear.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: A leader should always speak before listening.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Conflict should always be ignored to keep peace.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Stewardship means faithfully managing what God entrusts to you.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Accountability helps protect leaders from poor decisions.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Under pressure, a leader should depend on God and respond calmly.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Mentoring is mainly about keeping others dependent on you.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Integrity means your actions match your beliefs.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Ethical leadership means doing what is right even when it is hard.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Delegation can help develop future leaders.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: A leader builds trust by being honest and reliable.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Pride strengthens unity and teamwork.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: A gentle answer can help reduce conflict.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Wise leaders seek counsel and also pray for wisdom.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Leaders should never admit mistakes.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Serving others is a key part of Christ-centered leadership.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Long-term faithfulness matters more than short-term applause.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: A leader should avoid hard conversations at all costs.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Clear expectations can reduce confusion in a team.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Team unity requires everyone to have identical gifts.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: A leader should handle resources with transparency and responsibility.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Vision is only useful if it leads to action and obedience.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Mentorship is one way to multiply leadership over time.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: A leader should respond to pressure by blaming others.', options: ['True', 'False'], correct: 1 },
        { question: 'True or False: Humility helps leaders handle authority responsibly.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Restoration is often a goal in biblical conflict resolution.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: A leader\'s words can either build others up or tear them down.', options: ['True', 'False'], correct: 0 },
        { question: 'True or False: Finishing well includes perseverance and consistent obedience.', options: ['True', 'False'], correct: 0 },
      ];

      // Create 70 core questions for Leadership Final Exam
      for (let i = 0; i < leadershipCoreExamQuestions.length; i++) {
        const q = leadershipCoreExamQuestions[i];
        await base44.entities.FinalExamQuestion.create({
          exam_id: leadershipExam.id,
          question: q.q,
          options: q.opts,
          correct_answer_index: q.ans,
          category: q.cat,
          order: i + 1,
        });
      }

      // ========== CREATE ASSIGNMENTS ==========
      
      // Leadership Level 3 Assignment
      await base44.entities.TrainingAssignment.create({
        course_id: leadershipCourse3.id,
        title: 'Ministry Leadership Plan',
        description: 'Write a 750-word ministry leadership plan that addresses: (1) Your vision for ministry, (2) How you will develop leaders, (3) Your approach to governance and accountability, (4) Your succession plan. Include biblical support for your approach.',
        required: true,
      });

      // ========== CREATE LEARNING PATHS ==========
      
      // Complete Biblical Foundation Path
      await base44.entities.LearningPath.create({
        name: 'Complete Biblical Foundation',
        description: 'Master the fundamentals of Christian faith and theology through all three levels of Biblical Training',
        icon: '📖',
        track_ids: [biblicalTrack1.id, biblicalTrack2.id, biblicalTrack3.id],
        estimated_months: 12,
        order: 1,
        difficulty: 'beginner',
      });

      // Complete Leadership Development Path
      await base44.entities.LearningPath.create({
        name: 'Complete Leadership Development',
        description: 'Comprehensive leadership training from servant leadership basics to advanced ministry oversight',
        icon: '👑',
        track_ids: [leadershipTrack1.id, leadershipTrack2.id, leadershipTrack3.id],
        estimated_months: 10,
        order: 2,
        difficulty: 'intermediate',
      });

      // Foundation Track (Biblical L1 + Leadership L1)
      await base44.entities.LearningPath.create({
        name: 'Faith & Leadership Foundations',
        description: 'Build a strong foundation in both biblical knowledge and servant leadership principles',
        icon: '🌱',
        track_ids: [biblicalTrack1.id, leadershipTrack1.id],
        estimated_months: 6,
        order: 3,
        difficulty: 'beginner',
      });

      // Advanced Ministry Path (Biblical L3 + Leadership L3)
      await base44.entities.LearningPath.create({
        name: 'Advanced Ministry Leadership',
        description: 'Prepare for senior ministry roles with advanced discipleship and organizational leadership',
        icon: '⭐',
        track_ids: [biblicalTrack3.id, leadershipTrack3.id],
        estimated_months: 8,
        order: 4,
        difficulty: 'advanced',
      });

      // Complete Certification Path (All tracks)
      await base44.entities.LearningPath.create({
        name: 'Complete Certification Program',
        description: 'The full journey - all Biblical and Leadership training levels for comprehensive ministry preparation',
        icon: '🎓',
        track_ids: [
          biblicalTrack1.id, biblicalTrack2.id, biblicalTrack3.id,
          leadershipTrack1.id, leadershipTrack2.id, leadershipTrack3.id
        ],
        estimated_months: 18,
        order: 5,
        difficulty: 'advanced',
      });

      toast.success('All training content, exams, assignments, and learning paths created successfully!');
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to create training content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Training Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Click the button below to create Biblical Training Level 1 with 15 lessons and quiz questions.</p>
            <Button onClick={setupTraining} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Content...
                </>
              ) : (
                'Setup Training Content'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}