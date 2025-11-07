import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButton,
    MatCard,
    MatIcon,
    RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  year = new Date().getFullYear();

  features = [
    { icon: 'auto_fix_high', title: 'AI Descriptions', desc: 'Generate engaging video descriptions instantly.' },
    { icon: 'tag', title: 'Smart Hashtags', desc: 'Get trending hashtags that boost your reach.' },
    { icon: 'image_search', title: 'Image Prompts', desc: 'Create thumbnail ideas with AI-generated prompts.' },
  ];

  steps = [
    { title: '1. Paste Your Video Link', desc: 'Simply add your YouTube video link.' },
    { title: '2. Let AI Analyze', desc: 'Descripta understands and analyzes your content.' },
    { title: '3. Get Results', desc: 'Receive your description, hashtags, and image ideas instantly.' },
  ];

  testimonials = [
    {
      quote: 'Descripta saves me hours of writing and boosts engagement.',
      name: 'Sarah Johnson',
      role: 'YouTube Creator',
      avatar: 'assets/avatar1.jpg',
    },
    {
      quote: 'Finally, an AI that understands YouTube content perfectly!',
      name: 'Mike Chen',
      role: 'Tech Reviewer',
      avatar: 'assets/avatar2.jpg',
    },
    {
      quote: 'My workflow feels effortless now. Totally recommend Descripta.',
      name: 'Lisa Ahmed',
      role: 'Vlogger',
      avatar: 'assets/avatar3.jpg',
    },
  ];

  pricing = [
    {
      name: 'Free',
      price: '$0/mo',
      features: ['5 video analyses', 'Basic hashtags', 'Standard prompts'],
      button: 'Get Started',
    },
    {
      name: 'Pro',
      price: '$9/mo',
      features: ['Unlimited analyses', 'Smart hashtags', 'Custom image prompts'],
      button: 'Upgrade',
    },
    {
      name: 'Business',
      price: '$29/mo',
      features: ['Team access', 'Priority support', 'API integration'],
      button: 'Contact Us',
    },
  ];

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
