import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-helper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-helper.component.html',
  styleUrl: './ai-helper.component.css'
})
export class AiHelperComponent {
  isOpen = signal(typeof localStorage !== 'undefined' ? localStorage.getItem('ai_helper_open') === 'true' : false);
  newMessage = '';
  isTyping = signal(false);

  messages = signal<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hi! I\'m your HouseMate AI Assistant. I can help you find rooms near university belts, suggest roommate match criteria, draft agreement guidelines, or explain billing options. What can I do for you today?',
      timestamp: new Date()
    }
  ]);

  quickReplies = [
    'Rooms near DLSU',
    'Draft Roommate Agreement',
    'How to split water bills?',
    'List of verified hosts'
  ];

  private readonly responseTemplates: Record<string, string> = {
    'dlsu': 'I found a highly rated option: **Premium Loft near De La Salle University** in Malate, Manila. It costs ₱8,500/mo and features a verified landlord (Maria Santos). Would you like me to help you contact the host?',
    'bgc': 'There is a modern option in Taguig: **Modern Studio in Bonifacio Global City** for ₱18,000/mo. It has excellent amenities and is fully verified. Let me know if you want details!',
    'agreement': 'To draft a solid Roommate Agreement, make sure to cover: 1) Rent & Deposit splits, 2) Utility allocations, 3) Cleaning/chore schedules, 4) Guest policies, and 5) Quiet hours. You can search "Roommate Agreement" in our search bar to download templates!',
    'split': 'The best way to split utilities is: 1) Equally divided for water/internet, 2) Sub-metered or pro-rated based on appliance usage (e.g. air conditioners) for electricity. You can read our article "How to Split Utility Bills" for templates!',
    'verified': 'We verify hosts through government ID verification and on-site room inspection. Look for the "Verified" or "Highly Rated" badges next to listings (e.g. John Doe in BGC, Maria Santos in Malate) for safer co-living.'
  };

  toggleChat(): void {
    this.isOpen.update(v => {
      const nextValue = !v;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ai_helper_open', String(nextValue));
      }
      return nextValue;
    });
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(text?: string): void {
    const content = (text || this.newMessage).trim();
    if (!content) return;

    // Add user message
    this.messages.update(list => [...list, {
      sender: 'user',
      text: content,
      timestamp: new Date()
    }]);

    if (!text) {
      this.newMessage = '';
    }

    // Trigger typing state
    this.isTyping.set(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      this.isTyping.set(false);
      const reply = this.getAiResponse(content);
      this.messages.update(list => [...list, {
        sender: 'ai',
        text: reply,
        timestamp: new Date()
      }]);
    }, 1200);
  }

  private getAiResponse(query: string): string {
    const normalized = query.toLowerCase();
    
    if (normalized.includes('dlsu') || normalized.includes('la salle') || normalized.includes('malate')) {
      return this.responseTemplates['dlsu'];
    }
    if (normalized.includes('bgc') || normalized.includes('taguig') || normalized.includes('bonifacio')) {
      return this.responseTemplates['bgc'];
    }
    if (normalized.includes('agreement') || normalized.includes('contract') || normalized.includes('draft')) {
      return this.responseTemplates['agreement'];
    }
    if (normalized.includes('split') || normalized.includes('bill') || normalized.includes('water') || normalized.includes('electricity')) {
      return this.responseTemplates['split'];
    }
    if (normalized.includes('verified') || normalized.includes('host') || normalized.includes('landlord')) {
      return this.responseTemplates['verified'];
    }

    return "I'm here to help with HouseMate student housing! Try asking about 'rooms near DLSU', 'roommate agreements', 'splitting utility bills', or 'verified hosts'.";
  }
}
