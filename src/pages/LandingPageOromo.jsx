import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Users, Brain, Download, Heart } from 'lucide-react';

export default function LandingPageOromo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Ifa Amantii Kee – FaithLight</h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          FaithLight app ammayyaa dha — Kitaaba Qulqulluu dubbisi, AI waliin baradhu, hoggansa kiristaanaa leenjii fudhadhu.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-lg px-8 py-6">
              <Sparkles className="w-5 h-5" />
              App Jalqabi
            </Button>
          </Link>
          <Link to={createPageUrl('AIStudyContentCreator')}>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
              <BookOpen className="w-5 h-5" />
              Barnoota Jalqabi
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Maal Fayyada?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kitaaba Qulqulluu Dubbisi</h3>
            <p className="text-gray-600">Hiikkaa adda addaatiin dubbisi. Online fi offline dhukkubuuf karaa qabda.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Barnootaa</h3>
            <p className="text-gray-600">AI'n sagantaa barsiisuu, cimsannaa amantii, fi qormaata siif uuma.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hoggansa Kiristaanaa</h3>
            <p className="text-gray-600">Leenjii hoggansa kiristaanaa fi guddina amantii keessatti haala.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gareewwan</h3>
            <p className="text-gray-600">Amantoota waliin baradhu, mari'adhu, fi qormaata dorgomi.</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz</h3>
            <p className="text-gray-600">Beekumsa Kitaaba Qulqulluu kee qori fi guddisi.</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Offline Dhukkuba</h3>
            <p className="text-gray-600">Kitaaba Qulqulluu offline buufadhu fi yeroo barbaadde dubbisi.</p>
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="px-4 py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Addunyaa Guutuu</h2>
          <p className="text-lg text-gray-600 mb-8">
            FaithLight afaan adda addaatiin ni hojjetaa. Afan Oromoo, English, fi kanneen biroo.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900">Afan Oromoo</p>
              <p className="text-sm text-gray-600">Ethiopia & Diaspora</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900">English</p>
              <p className="text-sm text-gray-600">Global</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900">Kanneen Biroo</p>
              <p className="text-sm text-gray-600">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Jalqabi Har'a</h2>
        <p className="text-lg text-gray-600 mb-8">
          Amantii kee guddisi. Hoggansa keessatti jabaadhu. FaithLight waliin.
        </p>
        <Link to={createPageUrl('Home')}>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-lg px-8 py-6">
            <Sparkles className="w-5 h-5" />
            Jalqabi Erga Hadde
          </Button>
        </Link>
      </section>

      {/* Scripture Quote */}
      <section className="px-4 py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <p className="text-2xl font-light italic max-w-3xl mx-auto">
          "Omni Kitaabaa kee ibsa miillaa koo ti fi ifa daddarbaa koo."
        </p>
        <p className="text-sm mt-4 opacity-90">— Psaalmii 119:105</p>
      </section>
    </div>
  );
}