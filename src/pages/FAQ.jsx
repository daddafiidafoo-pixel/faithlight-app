import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      question: "Is FaithLight free to use?",
      answer: "Yes. FaithLight offers a Free plan that includes access to selected Bible lessons, quizzes, and limited AI Bible Tutor usage."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes. The Teacher / Pastor plan includes a 30-day free trial with full access to teaching and sermon tools."
    },
    {
      question: "Do I need a card to start the free trial?",
      answer: "Yes. A payment method is required to start the trial. You can cancel anytime before the trial ends and you will not be charged."
    },
    {
      question: "What happens when the trial ends?",
      answer: "If you don't cancel, your subscription will automatically continue at the regional price shown when you signed up."
    },
    {
      question: "Is pricing different by country?",
      answer: "Yes. FaithLight uses region-based pricing to reflect local economic conditions. Users in Africa receive special pricing so FaithLight remains accessible globally."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. You can cancel anytime. After canceling, you'll continue to have access until the end of your current billing period."
    },
    {
      question: "What happens if my payment fails?",
      answer: "If a payment fails:\n\n• We'll notify you and retry automatically\n• Your access continues for a short grace period\n• If payment isn't resolved, your account is downgraded to the Free plan\n\nNo data or drafts are deleted."
    },
    {
      question: "Can I change my country later?",
      answer: "You can change your country before your first payment. After your first payment, the country is locked to prevent abuse. If you relocate, contact support and we'll help."
    },
    {
      question: "Does FaithLight replace pastors or the Church?",
      answer: "No. FaithLight is a learning and preparation tool. Scripture, prayer, and the Church remain central."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">Everything you need to know about FaithLight</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Still have questions?</h3>
          <p className="text-blue-800 mb-4">We're here to help. Reach out to our support team.</p>
          <p className="text-sm text-blue-700">
            Contact us at: <a href="mailto:support@faithlight.com" className="underline font-medium">support@faithlight.com</a>
          </p>
        </div>

        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center italic">
            "Always test teaching against Scripture." — Acts 17:11
          </p>
        </div>
      </div>
    </div>
  );
}