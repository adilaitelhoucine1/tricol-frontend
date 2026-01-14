import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  features = [
    {
      icon: '📦',
      title: 'Gestion des Stocks',
      description: 'Suivi en temps réel avec méthode FIFO pour une gestion optimale des stocks'
    },
    {
      icon: '🛒',
      title: 'Approvisionnements',
      description: 'Gestion complète des commandes et des fournisseurs'
    },
    {
      icon: '👥',
      title: 'Multi-utilisateurs',
      description: 'Différents profils avec permissions adaptées à chaque rôle'
    },
    {
      icon: '🔒',
      title: 'Sécurisé',
      description: 'Authentification JWT et protection des données'
    }
  ];

  roles = [
    {
      name: 'Administrateur',
      description: 'Gestion complète du système'
    },
    {
      name: 'Responsable Achats',
      description: 'Gestion des approvisionnements'
    },
    {
      name: 'Magasinier',
      description: 'Gestion des stocks et inventaires'
    },
    {
      name: 'Chef d\'Atelier',
      description: 'Suivi de la production'
    }
  ];
}

