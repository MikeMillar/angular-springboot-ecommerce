package com.example.ecommerce.entity;

import lombok.Data;

import javax.persistence.*;

/**
 * created by:
 * author: MichaelMillar
 * date: 1/23/2022
 */

@Entity
@Table(name = "state")
@Data
public class State {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;

}
